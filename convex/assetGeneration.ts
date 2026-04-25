"use node";

import Anthropic from "@anthropic-ai/sdk";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

const GENERATE_ASSETS_PROMPT = `You are PostPod, a specialist assistant for podcast hosts. Your job: turn a raw episode transcript into five publish-ready assets that make the host's work easier and the episode more discoverable.

EPISODE TRANSCRIPT:
{{TRANSCRIPT}}

EPISODE TITLE (host-provided, for context only):
{{EPISODE_TITLE}}

Your output must be a JSON object matching the schema exactly. Follow these rules for each asset:

1. TITLES (generate exactly 5 options) + HOOK SCORES:
Write titles that are hooky and make someone want to click, but honest — never clickbait that the episode doesn't deliver on. Match the tone of the conversation itself: if it's intellectual, titles should feel intellectual; if it's playful, lean playful. Mix formats across the 5:
- One that's a specific claim or insight from the episode
- One that's a provocative question the episode answers
- One that names the guest + hook
- One that's a numbered/listicle feel if content supports it
- One wildcard: a sharp phrase pulled or adapted from the guest's actual words
Each title: 8-14 words ideal, never exceed 70 characters.

After writing the 5 titles, score each one 0–100 for hookability: how likely is a podcast listener scrolling their feed to click this, while it remaining honest to the content? Score on four dimensions equally weighted:
- Specificity: makes a concrete claim, not a vague promise
- Curiosity gap: creates genuine want-to-know-more without misleading
- Clarity: immediately understandable to the target audience
- Authenticity: feels true to the episode, avoids hype words
Return the scores in hookScores[] in the same order as titles[].

2. CHAPTERS:
Break the episode into 5-12 chapters based on actual topic shifts in the transcript, not arbitrary time windows. Each chapter:
- timestamp: mark where the chapter starts (use MM:SS for episodes under 1hr, HH:MM:SS for longer)
- title: 3-7 words, specific to what's actually discussed
- summary: one sentence, 15-25 words, giving the listener a reason to care
Chapter 1 should start at 00:00.

3. PULL QUOTES (3-5):
Find the most shareable, quotable moments in the transcript. Criteria:
- Stand alone without context
- Surprising, counterintuitive, or beautifully phrased
- Ideally from the guest, not the host
- 10-30 words each
Prefer actual spoken words; lightly edit for readability but never invent words the speaker didn't say.

4. LINKEDIN POST:
Write as the podcast host would post it. Structure:
- Hook line (first 2 lines must grab attention before the "see more" cutoff)
- 2-4 short paragraphs
- 3-5 concrete takeaways or insights from the episode
- Soft CTA at the end
- Tone: thoughtful but punchy, 0 emojis unless the podcast's tone is playful, 0 hashtag-spam
- Length: 150-300 words total
Write in first person as if the host is posting. Reference the guest by name.

5. SHOW NOTES:
Standard podcast show notes, 250-400 words total:
- Opening paragraph: 2-3 sentences describing the episode
- "In this episode" bullet list: 5-8 bullets, each starting with a strong verb
- "About the guest" paragraph if a guest is named
- "Timestamps" section referencing the chapters
End with "Subscribe so you don't miss the next episode."

GENERAL PRINCIPLES ACROSS ALL ASSETS:
- Never invent facts, quotes, or claims not present in the transcript.
- If the transcript is sparse or cut off, prefer shorter quality output over padded filler.
- Match the intellectual register of the conversation.
- Avoid generic marketing phrases ("dive deep", "unpacks", "game-changer", "masterclass") unless they fit.
- Names must be spelled as they appear in the transcript. Do not guess.

Return only the JSON object, no preamble.`;

const ASSETS_TOOL: Anthropic.Messages.Tool = {
  name: "generate_assets",
  description: "Generate structured podcast assets from a transcript.",
  input_schema: {
    type: "object",
    properties: {
      titles: {
        type: "array",
        items: { type: "string" },
        description: "Exactly 5 title options.",
      },
      hookScores: {
        type: "array",
        items: { type: "integer", minimum: 0, maximum: 100 },
        description: "Hook score 0-100 for each title in the same order.",
      },
      chapters: {
        type: "array",
        items: {
          type: "object",
          properties: {
            timestamp: { type: "string", description: "MM:SS or HH:MM:SS" },
            title: { type: "string", description: "3-7 words" },
            summary: { type: "string", description: "One sentence, 15-25 words" },
          },
          required: ["timestamp", "title", "summary"],
        },
      },
      pullQuotes: {
        type: "array",
        items: { type: "string" },
        description: "3-5 pull quotes.",
      },
      linkedInPost: { type: "string" },
      showNotes: { type: "string" },
    },
    required: ["titles", "chapters", "pullQuotes", "linkedInPost", "showNotes"],
  },
};

type GeneratedAssets = {
  titles: string[];
  hookScores?: number[];
  chapters: Array<{ timestamp: string; title: string; summary: string }>;
  pullQuotes: string[];
  linkedInPost: string;
  showNotes: string;
};

export const generateAssets = action({
  args: { episodeId: v.id("episodes") },
  handler: async (ctx, { episodeId }) => {
    const episode = await ctx.runQuery(internal.transcription.getEpisodeInternal, { episodeId });
    if (!episode) throw new Error("Episode not found");
    if (!episode.transcript) throw new Error("No transcript available for asset generation");

    await ctx.runMutation(internal.transcription.setStatus, {
      episodeId,
      status: "generating",
    });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

    // Cap transcript at 80,000 chars (~1.5 hrs of speech).
    // Beyond this, quality doesn't improve and the API call risks timing out.
    const MAX_CHARS = 80_000;
    const rawTranscript = episode.transcript;
    const transcript = rawTranscript.length > MAX_CHARS
      ? rawTranscript.slice(0, MAX_CHARS) + "\n\n[Transcript truncated — generate assets from the portion above only]"
      : rawTranscript;

    const prompt = GENERATE_ASSETS_PROMPT
      .replace("{{TRANSCRIPT}}", transcript)
      .replace("{{EPISODE_TITLE}}", episode.title);

    // 5-minute timeout — generous for even long transcripts
    const client = new Anthropic({ apiKey, timeout: 300_000 });

    let response: Anthropic.Messages.Message;
    try {
      response = await client.messages.create({
        model: "claude-opus-4-7",
        max_tokens: 4096,
        tools: [ASSETS_TOOL],
        tool_choice: { type: "tool", name: "generate_assets" },
        messages: [{ role: "user", content: prompt }],
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await ctx.runMutation(internal.transcription.setError, { episodeId, error: `Anthropic error: ${msg}` });
      throw err;
    }

    const toolBlock = response.content.find(
      (b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use",
    );
    if (!toolBlock) {
      await ctx.runMutation(internal.transcription.setError, {
        episodeId,
        error: "No tool_use block in Anthropic response",
      });
      throw new Error("No tool_use block in Anthropic response");
    }

    const assets = toolBlock.input as GeneratedAssets;

    await ctx.runMutation(internal.assets.saveAssets, {
      episodeId,
      titles: assets.titles,
      hookScores: assets.hookScores,
      chapters: assets.chapters,
      pullQuotes: assets.pullQuotes,
      linkedInPost: assets.linkedInPost,
      showNotes: assets.showNotes,
    });
  },
});
