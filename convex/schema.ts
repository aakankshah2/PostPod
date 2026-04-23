import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  // ── Auth system tables (provided by @convex-dev/auth) ──
  ...authTables,

  // ── App tables ──

  // Per-user credit balance. Created on first sign-in (1 free credit).
  // userId references the users table from authTables.
  userCredits: defineTable({
    userId: v.id("users"),
    creditsRemaining: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Each podcast episode a user submits for processing.
  episodes: defineTable({
    userId: v.id("users"),
    title: v.string(),
    audioStorageId: v.optional(v.id("_storage")),
    transcript: v.optional(v.string()),
    status: v.union(
      v.literal("uploaded"),
      v.literal("transcribing"),
      v.literal("transcribed"),
      v.literal("generating"),
      v.literal("complete"),
      v.literal("error"),
    ),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_created", ["userId", "createdAt"]),

  // AI-generated assets for a completed episode.
  assets: defineTable({
    episodeId: v.id("episodes"),
    titles: v.array(
      v.object({
        text: v.string(),
        score: v.number(),
      }),
    ),
    chapters: v.array(
      v.object({
        time: v.string(),
        label: v.string(),
        summary: v.optional(v.string()),
      }),
    ),
    pullQuotes: v.array(
      v.object({
        text: v.string(),
        timestamp: v.optional(v.string()),
        bestFor: v.optional(v.string()),
      }),
    ),
    linkedInPost: v.string(),
    showNotes: v.optional(v.string()),
    timestamps: v.array(
      v.object({
        time: v.string(),
        label: v.string(),
        dur: v.optional(v.string()),
      }),
    ),
    createdAt: v.number(),
  }).index("by_episode", ["episodeId"]),

  // Razorpay payment records. Credits are only granted after
  // server-side HMAC signature verification succeeds.
  transactions: defineTable({
    userId: v.id("users"),
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.optional(v.string()),
    creditsPurchased: v.number(),
    amountInr: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
    ),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_order", ["razorpayOrderId"]),

  // Pre-launch waitlist (existing).
  waitlist: defineTable({
    email: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),
});
