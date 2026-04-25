import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

// Kicked off by the client immediately after episode creation.
// Polls Replicate until Whisper finishes, then writes the transcript.
export const startTranscription = action({
  args: { episodeId: v.id("episodes") },
  handler: async (ctx, { episodeId }) => {
    const episode = await ctx.runQuery(internal.transcription.getEpisodeInternal, { episodeId });
    if (!episode) throw new Error("Episode not found");
    if (!episode.audioStorageId) throw new Error("No audio file — nothing to transcribe");

    await ctx.runMutation(internal.transcription.setStatus, {
      episodeId,
      status: "transcribing",
    });

    const audioUrl = await ctx.storage.getUrl(episode.audioStorageId);
    if (!audioUrl) throw new Error("Audio file missing from storage");

    const apiKey = process.env.REPLICATE_API_TOKEN;
    if (!apiKey) throw new Error("REPLICATE_API_TOKEN not set");

    // Resolve the latest published version of openai/whisper dynamically —
    // avoids hardcoding a version hash while still using /v1/predictions,
    // which works for community models (unlike /v1/models/.../predictions).
    const modelRes = await fetch("https://api.replicate.com/v1/models/openai/whisper", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!modelRes.ok) {
      const body = await modelRes.text();
      await ctx.runMutation(internal.transcription.setError, {
        episodeId,
        error: `Could not fetch Whisper model info (${modelRes.status}): ${body}`,
      });
      throw new Error(`Could not fetch Whisper model info: ${body}`);
    }
    const modelData = (await modelRes.json()) as { latest_version?: { id: string } };
    const version = modelData.latest_version?.id;
    if (!version) {
      await ctx.runMutation(internal.transcription.setError, {
        episodeId,
        error: "openai/whisper has no published version on Replicate",
      });
      throw new Error("openai/whisper has no published version on Replicate");
    }

    // Prefer: wait=60 asks Replicate to return synchronously for short files;
    // longer files fall through to the polling loop below.
    const createRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Prefer: "wait=60",
      },
      body: JSON.stringify({
        version,
        input: {
          audio: audioUrl,
          model: "large-v3",
          language: "auto",
          transcription: "plain text",
          translate: false,
        },
      }),
    });

    if (!createRes.ok) {
      const body = await createRes.text();
      await ctx.runMutation(internal.transcription.setError, {
        episodeId,
        error: `Replicate error (${createRes.status}): ${body}`,
      });
      throw new Error(`Replicate error: ${body}`);
    }

    let prediction = (await createRes.json()) as ReplicatePrediction;

    // Poll every 5 seconds, max 120 attempts (10 minutes total)
    const MAX_POLLS = 120;
    let polls = 0;
    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed" &&
      prediction.status !== "canceled"
    ) {
      if (polls >= MAX_POLLS) {
        await ctx.runMutation(internal.transcription.setError, {
          episodeId,
          error: "Transcription timed out after 10 minutes. Try a shorter file.",
        });
        return;
      }
      await sleep(5000);
      polls++;
      const pollRes = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        { headers: { Authorization: `Bearer ${apiKey}` } },
      );
      if (!pollRes.ok) {
        // Non-200 from Replicate — log and retry next cycle
        continue;
      }
      prediction = (await pollRes.json()) as ReplicatePrediction;
    }

    if (prediction.status !== "succeeded") {
      const err = prediction.error ?? "Transcription failed";
      await ctx.runMutation(internal.transcription.setError, { episodeId, error: err });
      throw new Error(err);
    }

    const transcript =
      prediction.output?.transcription ?? prediction.output?.text ?? "";

    await ctx.runMutation(internal.transcription.saveTranscript, {
      episodeId,
      transcript,
    });

    // Immediately kick off asset generation
    await ctx.scheduler.runAfter(0, api.assetGeneration.generateAssets, { episodeId });
  },
});

export const getEpisodeInternal = internalQuery({
  args: { episodeId: v.id("episodes") },
  handler: async (ctx, { episodeId }) => ctx.db.get(episodeId),
});

export const setStatus = internalMutation({
  args: {
    episodeId: v.id("episodes"),
    status: v.union(v.literal("transcribing"), v.literal("generating")),
  },
  handler: async (ctx, { episodeId, status }) => {
    await ctx.db.patch(episodeId, { status });
  },
});

export const setError = internalMutation({
  args: { episodeId: v.id("episodes"), error: v.string() },
  handler: async (ctx, { episodeId, error }) => {
    await ctx.db.patch(episodeId, { status: "error", errorMessage: error });
  },
});

export const saveTranscript = internalMutation({
  args: { episodeId: v.id("episodes"), transcript: v.string() },
  handler: async (ctx, { episodeId, transcript }) => {
    await ctx.db.patch(episodeId, { transcript, status: "transcribed" });
  },
});

type ReplicatePrediction = {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output?: { transcription?: string; text?: string };
  error?: string;
};

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
