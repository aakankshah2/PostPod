import { v } from "convex/values";
import { action, internalAction, internalMutation, internalQuery } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

const REPLICATE_POLL_INTERVAL_MS = 15_000; // 15 seconds between checks
const MAX_PROCESSING_MINUTES = 40;          // give up after 40 minutes

// Called by the client immediately after episode creation.
// Submits the job to Replicate and schedules the first status check.
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

    // Fetch latest Whisper version
    const modelRes = await fetch("https://api.replicate.com/v1/models/openai/whisper", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!modelRes.ok) {
      const body = await modelRes.text();
      await ctx.runMutation(internal.transcription.setError, {
        episodeId,
        error: `Could not fetch Whisper model info (${modelRes.status}): ${body}`,
      });
      return;
    }
    const modelData = (await modelRes.json()) as { latest_version?: { id: string } };
    const version = modelData.latest_version?.id;
    if (!version) {
      await ctx.runMutation(internal.transcription.setError, {
        episodeId,
        error: "openai/whisper has no published version on Replicate",
      });
      return;
    }

    // Submit prediction asynchronously — no Prefer: wait, no polling here
    const createRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
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
      return;
    }

    const prediction = (await createRes.json()) as ReplicatePrediction;

    // Store the prediction ID so the scheduler can check it
    await ctx.runMutation(internal.transcription.savePredictionId, {
      episodeId,
      predictionId: prediction.id,
    });

    // If Replicate already finished synchronously, handle it immediately
    if (prediction.status === "succeeded") {
      const transcript =
        prediction.output?.transcription ?? prediction.output?.text ?? "";
      await ctx.runMutation(internal.transcription.saveTranscript, { episodeId, transcript });
      await ctx.scheduler.runAfter(0, api.assetGeneration.generateAssets, { episodeId });
      return;
    }

    if (prediction.status === "failed" || prediction.status === "canceled") {
      await ctx.runMutation(internal.transcription.setError, {
        episodeId,
        error: prediction.error ?? "Transcription failed immediately",
      });
      return;
    }

    // Schedule the first status check
    await ctx.scheduler.runAfter(
      REPLICATE_POLL_INTERVAL_MS,
      internal.transcription.checkTranscription,
      { episodeId },
    );
  },
});

// Scheduled internally — checks Replicate once and either completes,
// errors, or reschedules itself until the job is done.
export const checkTranscription = internalAction({
  args: { episodeId: v.id("episodes") },
  handler: async (ctx, { episodeId }) => {
    const episode = await ctx.runQuery(internal.transcription.getEpisodeInternal, { episodeId });
    if (!episode) return;

    // Already resolved (completed, errored, or a duplicate check arrived late)
    if (episode.status !== "transcribing") return;

    // Safety: give up after MAX_PROCESSING_MINUTES
    const ageMinutes = (Date.now() - episode.createdAt) / 1000 / 60;
    if (ageMinutes > MAX_PROCESSING_MINUTES) {
      await ctx.runMutation(internal.transcription.setError, {
        episodeId,
        error: `Transcription timed out after ${MAX_PROCESSING_MINUTES} minutes. Try a shorter file or upload a transcript instead.`,
      });
      return;
    }

    const predictionId = episode.replicatePredictionId;
    if (!predictionId) {
      await ctx.runMutation(internal.transcription.setError, {
        episodeId,
        error: "No Replicate prediction ID found — transcription may not have started.",
      });
      return;
    }

    const apiKey = process.env.REPLICATE_API_TOKEN;
    if (!apiKey) return;

    const pollRes = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      { headers: { Authorization: `Bearer ${apiKey}` } },
    );

    if (!pollRes.ok) {
      // Transient Replicate error — reschedule and try again
      await ctx.scheduler.runAfter(
        REPLICATE_POLL_INTERVAL_MS,
        internal.transcription.checkTranscription,
        { episodeId },
      );
      return;
    }

    const prediction = (await pollRes.json()) as ReplicatePrediction;

    if (prediction.status === "succeeded") {
      const transcript =
        prediction.output?.transcription ?? prediction.output?.text ?? "";
      await ctx.runMutation(internal.transcription.saveTranscript, { episodeId, transcript });
      await ctx.scheduler.runAfter(0, api.assetGeneration.generateAssets, { episodeId });
      return;
    }

    if (prediction.status === "failed" || prediction.status === "canceled") {
      await ctx.runMutation(internal.transcription.setError, {
        episodeId,
        error: prediction.error ?? "Transcription failed on Replicate",
      });
      return;
    }

    // Still running — schedule another check
    await ctx.scheduler.runAfter(
      REPLICATE_POLL_INTERVAL_MS,
      internal.transcription.checkTranscription,
      { episodeId },
    );
  },
});

// ── Internal queries & mutations ─────────────────────────────────────────────

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

export const savePredictionId = internalMutation({
  args: { episodeId: v.id("episodes"), predictionId: v.string() },
  handler: async (ctx, { episodeId, predictionId }) => {
    await ctx.db.patch(episodeId, { replicatePredictionId: predictionId });
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
