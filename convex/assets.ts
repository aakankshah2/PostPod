import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const saveAssets = internalMutation({
  args: {
    episodeId: v.id("episodes"),
    titles: v.array(v.string()),
    chapters: v.array(
      v.object({ timestamp: v.string(), title: v.string(), summary: v.string() }),
    ),
    pullQuotes: v.array(v.string()),
    linkedInPost: v.string(),
    showNotes: v.string(),
  },
  handler: async (ctx, { episodeId, ...fields }) => {
    await ctx.db.insert("assets", {
      episodeId,
      ...fields,
      createdAt: Date.now(),
    });
    await ctx.db.patch(episodeId, { status: "complete" });
  },
});

export const getAssets = query({
  args: { episodeId: v.id("episodes") },
  handler: async (ctx, { episodeId }) => {
    const episode = await ctx.db.get(episodeId);
    if (!episode) return null;

    if (episode.userId) {
      const userId = await getAuthUserId(ctx);
      if (userId !== episode.userId) return null;
    }

    return await ctx.db
      .query("assets")
      .withIndex("by_episode", (q) => q.eq("episodeId", episodeId))
      .unique();
  },
});
