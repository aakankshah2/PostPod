import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const insertPendingTransaction = internalMutation({
  args: {
    userId: v.id("users"),
    razorpayOrderId: v.string(),
    creditsPurchased: v.number(),
    amountInr: v.number(),
  },
  handler: async (ctx, { userId, razorpayOrderId, creditsPurchased, amountInr }) => {
    await ctx.db.insert("transactions", {
      userId,
      razorpayOrderId,
      creditsPurchased,
      amountInr,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const getTransactionByOrder = internalQuery({
  args: { razorpayOrderId: v.string() },
  handler: async (ctx, { razorpayOrderId }) => {
    return await ctx.db
      .query("transactions")
      .withIndex("by_order", (q) => q.eq("razorpayOrderId", razorpayOrderId))
      .unique();
  },
});

export const markTransactionPaid = internalMutation({
  args: {
    userId: v.id("users"),
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.string(),
    razorpaySignature: v.optional(v.string()),
  },
  handler: async (ctx, { userId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
    const tx = await ctx.db
      .query("transactions")
      .withIndex("by_order", (q) => q.eq("razorpayOrderId", razorpayOrderId))
      .unique();

    if (!tx) throw new Error("Transaction not found");
    if (tx.userId !== userId) throw new Error("Transaction ownership mismatch");
    if (tx.status === "paid") return null; // idempotent — caller must NOT add credits again

    await ctx.db.patch(tx._id, {
      status: "paid",
      razorpayPaymentId,
      ...(razorpaySignature ? { razorpaySignature } : {}),
    });
    return tx.creditsPurchased;
  },
});

export const markTransactionFailed = internalMutation({
  args: { razorpayOrderId: v.string() },
  handler: async (ctx, { razorpayOrderId }) => {
    const tx = await ctx.db
      .query("transactions")
      .withIndex("by_order", (q) => q.eq("razorpayOrderId", razorpayOrderId))
      .unique();
    if (tx?.status === "pending") {
      await ctx.db.patch(tx._id, { status: "failed" });
    }
  },
});
