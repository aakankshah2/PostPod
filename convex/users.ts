import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

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

export const getMyCredits = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const record = await ctx.db
      .query("userCredits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return record?.creditsRemaining ?? 0;
  },
});

export const spendCredit = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

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

export const spendCreditForEpisode = mutation({
  args: { episodeId: v.id("episodes") },
  handler: async (ctx, { episodeId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const episode = await ctx.db.get(episodeId);
    if (!episode) throw new Error("Episode not found");
    // If episode has an owner, verify it matches the requesting user
    if (episode.userId && episode.userId !== userId) throw new Error("Episode not found");
    if (episode.creditSpent === true) return; // idempotent

    const record = await ctx.db
      .query("userCredits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!record || record.creditsRemaining < 1) throw new Error("NO_CREDITS");

    await ctx.db.patch(record._id, { creditsRemaining: record.creditsRemaining - 1 });
    await ctx.db.patch(episodeId, { creditSpent: true });
  },
});

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
