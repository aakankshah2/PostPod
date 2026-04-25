import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return NextResponse.json({ error: "NEXT_PUBLIC_CONVEX_URL is not set" }, { status: 500 });
  }
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
  const rawBody = await req.text();

  // Signature verification
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (webhookSecret) {
    const signature = req.headers.get("x-razorpay-signature") ?? "";
    const expected = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");
    if (expected !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } else {
    console.warn("RAZORPAY_WEBHOOK_SECRET not set — skipping webhook signature verification");
  }

  let event: unknown;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    typeof event !== "object" ||
    event === null ||
    (event as Record<string, unknown>).event !== "payment.captured"
  ) {
    return NextResponse.json({ ignored: true });
  }

  const payload = (event as Record<string, unknown>).payload;
  const paymentEntity =
    payload &&
    typeof payload === "object" &&
    (payload as Record<string, unknown>).payment &&
    typeof (payload as Record<string, unknown>).payment === "object"
      ? ((payload as Record<string, unknown>).payment as Record<string, unknown>).entity
      : null;

  if (
    !paymentEntity ||
    typeof paymentEntity !== "object" ||
    typeof (paymentEntity as Record<string, unknown>).id !== "string" ||
    typeof (paymentEntity as Record<string, unknown>).order_id !== "string"
  ) {
    return NextResponse.json({ error: "Unexpected payload shape" }, { status: 400 });
  }

  const razorpayPaymentId = (paymentEntity as Record<string, unknown>).id as string;
  const razorpayOrderId = (paymentEntity as Record<string, unknown>).order_id as string;

  try {
    const result = await convex.action(api.payments.processWebhookPayment, {
      razorpayOrderId,
      razorpayPaymentId,
    });
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // "Transaction not found" means the order isn't in Convex yet (race condition on fast payments).
    // Return 5xx so Razorpay retries after a delay.
    if (msg.includes("Transaction not found")) {
      console.error("Webhook: transaction not found, will be retried by Razorpay:", msg);
      return NextResponse.json({ error: "Transaction not found" }, { status: 500 });
    }
    console.error("Webhook Convex action failed:", err);
    // Return 200 so Razorpay doesn't retry endlessly for errors we own
    return NextResponse.json({ error: "Internal error", ok: false });
  }
}
