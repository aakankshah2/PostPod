import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getEpisode = query({
  args: { episodeId: v.id("episodes") },
  handler: async (ctx, { episodeId }) => {
    const episode = await ctx.db.get(episodeId);
    if (!episode) return null;
    // If episode has an owner, verify the requesting user matches
    if (episode.userId) {
      const userId = await getAuthUserId(ctx);
      if (userId !== episode.userId) return null;
    }
    return episode;
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const createEpisode = mutation({
  args: {
    title: v.string(),
    audioStorageId: v.optional(v.id("_storage")),
    transcript: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    return await ctx.db.insert("episodes", {
      userId: userId ?? undefined,
      title: args.title,
      audioStorageId: args.audioStorageId,
      transcript: args.transcript,
      status: "uploaded",
      createdAt: Date.now(),
    });
  },
});



export const getMyEpisodes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("episodes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
  },
});
