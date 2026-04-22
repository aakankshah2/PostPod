import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const addToWaitlist = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const normalized = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalized)) {
      throw new Error("INVALID_EMAIL");
    }

    const existing = await ctx.db
      .query("waitlist")
      .filter((q) => q.eq(q.field("email"), normalized))
      .first();

    if (existing) {
      throw new Error("ALREADY_ON_LIST");
    }

    await ctx.db.insert("waitlist", {
      email: normalized,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});
