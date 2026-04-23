import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

// Resolve the current user's Convex _id from their auth identity.
// @convex-dev/auth sets the JWT subject to the users table _id.
async function currentUserId(ctx: QueryCtx | MutationCtx): Promise<Id<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return identity.subject as Id<"users">;
}

// Called after successful sign-in. Creates a credit record for new users
// with 1 free episode. Safe to call on every sign-in (idempotent).
export const ensureUserCredits = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const existing = await ctx.db
      .query("userCredits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!existing) {
      await ctx.db.insert("userCredits", {
        userId,
        creditsRemaining: 1,
        createdAt: Date.now(),
      });
    }
  },
});

// Returns the current user's credit balance, or null if not signed in.
export const getMyCredits = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const userId = identity.subject as Id<"users">;
    const record = await ctx.db
      .query("userCredits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return record?.creditsRemaining ?? 0;
  },
});

// Decrement credits by 1 after a successful generation.
// Throws if the user has no credits remaining.
export const spendCredit = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await currentUserId(ctx);
    const record = await ctx.db
      .query("userCredits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!record || record.creditsRemaining < 1) {
      throw new Error("NO_CREDITS");
    }

    await ctx.db.patch(record._id, {
      creditsRemaining: record.creditsRemaining - 1,
    });
  },
});

// Add credits after a verified Razorpay payment.
export const addCredits = internalMutation({
  args: { userId: v.id("users"), amount: v.number() },
  handler: async (ctx, { userId, amount }) => {
    const record = await ctx.db
      .query("userCredits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (record) {
      await ctx.db.patch(record._id, {
        creditsRemaining: record.creditsRemaining + amount,
      });
    } else {
      await ctx.db.insert("userCredits", {
        userId,
        creditsRemaining: amount,
        createdAt: Date.now(),
      });
    }
  },
});
