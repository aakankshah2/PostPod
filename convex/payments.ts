"use node";

import Razorpay from "razorpay";
import crypto from "crypto";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

const PACKS = {
  single: { credits: 1,  amountInPaise: 29900  },
  pack:   { credits: 10, amountInPaise: 249900 },
} as const;

export const createOrder = action({
  args: { packId: v.union(v.literal("single"), v.literal("pack")) },
  handler: async (ctx, { packId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) throw new Error("Razorpay keys not configured");

    const pack = PACKS[packId];
    const rp = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await rp.orders.create({
      amount: pack.amountInPaise,
      currency: "INR",
      receipt: `postpod_${Date.now()}`,
    });

    await ctx.runMutation(internal.transactions.insertPendingTransaction, {
      userId,
      razorpayOrderId: order.id,
      creditsPurchased: pack.credits,
      amountInr: pack.amountInPaise / 100,
    });

    return { orderId: order.id, amount: pack.amountInPaise, keyId };
  },
});

export const verifyPayment = action({
  args: {
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.string(),
    razorpaySignature: v.string(),
  },
  handler: async (ctx, { razorpayOrderId, razorpayPaymentId, razorpaySignature }): Promise<{ creditsPurchased: number }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) throw new Error("Razorpay key secret not configured");

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      await ctx.runMutation(internal.transactions.markTransactionFailed, { razorpayOrderId });
      throw new Error("Payment verification failed — signature mismatch");
    }

    const creditsPurchased: number | null = await ctx.runMutation(internal.transactions.markTransactionPaid, {
      userId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (creditsPurchased === null) return { creditsPurchased: 0 }; // already paid by webhook
    await ctx.runMutation(internal.users.addCredits, { userId, amount: creditsPurchased });
    return { creditsPurchased };
  },
});

export const processWebhookPayment = action({
  args: {
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.string(),
  },
  handler: async (ctx, { razorpayOrderId, razorpayPaymentId }): Promise<{ creditsPurchased: number; alreadyProcessed?: boolean }> => {
    // Look up the pending transaction to get userId
    const tx: Doc<"transactions"> | null = await ctx.runQuery(
      internal.transactions.getTransactionByOrder,
      { razorpayOrderId },
    );

    if (!tx) throw new Error("Transaction not found for order: " + razorpayOrderId);
    if (tx.status === "paid") return { alreadyProcessed: true, creditsPurchased: tx.creditsPurchased };

    const creditsPurchased = await ctx.runMutation(
      internal.transactions.markTransactionPaid,
      {
        userId: tx.userId,
        razorpayOrderId,
        razorpayPaymentId,
      },
    );

    // null means markTransactionPaid found it already paid (race with verifyPayment) — credits already granted
    if (creditsPurchased === null) return { alreadyProcessed: true, creditsPurchased: tx.creditsPurchased };
    await ctx.runMutation(internal.users.addCredits, {
      userId: tx.userId,
      amount: creditsPurchased,
    });

    return { creditsPurchased };
  },
});
