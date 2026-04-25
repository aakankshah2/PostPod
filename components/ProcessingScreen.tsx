"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { IconCheck } from "@/components/icons";

const STAGES = [
  { key: "transcribe", label: "Transcribing audio",            weight: 35, time: "~1 min" },
  { key: "analyze",   label: "Analyzing content & structure", weight: 40, time: "18s" },
  { key: "generate",  label: "Generating outputs",            weight: 25, time: "14s" },
] as const;

// Duration of the post-transcription simulated animation (stages 1–2)
const SIM_MS = 8000;
// Duration of the full demo animation
const DEMO_MS = 6000;

type Props = {
  episodeName: string;
  episodeId?: string;
  onComplete: () => void;
  onError?: (msg: string) => void;
};

export function ProcessingScreen({ episodeName, episodeId, onComplete, onError }: Props) {
  const isDemo = !episodeId;

  // Subscribe to the real episode when we have an ID; skip query in demo mode
  const episode = useQuery(
    api.episodes.getEpisode,
    episodeId ? { episodeId: episodeId as Id<"episodes"> } : "skip",
  );

  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // Keep callbacks in refs so effects don't go stale
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // ── DEMO MODE: original timed animation ──────────────────────────────────
  useEffect(() => {
    if (!isDemo) return;
    const start = Date.now();
    let raf: number;
    const tick = () => {
      const t = Date.now() - start;
      const p = Math.min(100, (t / DEMO_MS) * 100);
      setProgress(p);
      setElapsed(Math.round(t / 1000));
      if (p < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => onCompleteRef.current(), 400);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isDemo]);

  // ── REAL MODE: elapsed timer while transcribing ──────────────────────────
  useEffect(() => {
    if (isDemo) return;
    const id = setInterval(() => {
      setElapsed((e) => {
        // Client-side safety net: if stuck for 12 min, surface an error
        if (e >= 720) {
          onErrorRef.current?.("Transcription is taking too long. Please try again.");
          clearInterval(id);
        }
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isDemo]);

  // ── REAL MODE: watch for transcription done, then simulate stages 1–2 ───
  // simPhase: idle → running → done
  const [simPhase, setSimPhase] = useState<"idle" | "running" | "done">("idle");

  useEffect(() => {
    if (isDemo || simPhase !== "idle" || !episode) return;

    if (episode.status === "error") {
      onErrorRef.current?.(episode.errorMessage ?? "Processing failed");
      return;
    }

    // Fast path: assets already ready by the time we mount
    if (episode.status === "complete") {
      setSimPhase("done");
      setTimeout(() => onCompleteRef.current(), 400);
      return;
    }

    // Start animation once transcription is done (episode has a transcript)
    const transcriptionDone =
      episode.status === "transcribed" ||
      episode.status === "generating" ||
      (episode.status === "uploaded" && !!episode.transcript);

    if (transcriptionDone) {
      setSimPhase("running");
    }
  }, [isDemo, episode, simPhase]);

  // Separate effect so the RAF isn't cancelled when episode updates mid-animation
  useEffect(() => {
    if (simPhase !== "running") return;
    setProgress(35); // jump to 35% — transcription weight
    const start = Date.now();
    let raf: number;
    const tick = () => {
      const t = Date.now() - start;
      const p = 35 + Math.min(64, (t / SIM_MS) * 64); // cap at 99% — onComplete drives the final jump
      setProgress(p);
      if (p < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setSimPhase("done"); // hold at 99% — wait for episode.status === "complete"
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [simPhase]);

  // Fire onComplete when episode is done — whether animation finished early or late.
  useEffect(() => {
    if (isDemo || (simPhase !== "running" && simPhase !== "done")) return;
    if (episode?.status === "complete") {
      setSimPhase("done");
      setTimeout(() => onCompleteRef.current(), 400);
    } else if (episode?.status === "error") {
      onErrorRef.current?.(episode.errorMessage ?? "Generation failed");
    }
  }, [isDemo, episode?.status, simPhase]);

  // ── Stage computation ────────────────────────────────────────────────────
  // In real mode during transcription, stage 0 is always "active" (progress = 0).
  // Once simPhase kicks in, progress moves from 35→100 and stage 0 is done.
  let cumulative = 0;
  const stageStates = STAGES.map((s) => {
    const start = cumulative;
    const end = cumulative + s.weight;
    cumulative = end;
    const state = progress >= end ? "done" : progress >= start ? "active" : "pending";
    return { ...s, state, start, end };
  });

  const activeStage =
    stageStates.find((s) => s.state === "active") ?? stageStates[stageStates.length - 1];

  // Stage 0 is "active" even at progress=0 in real mode (transcribing)
  const isTranscribing = !isDemo && simPhase === "idle" && episode?.status === "transcribing";

  const stageLabel = (s: (typeof stageStates)[number]) => {
    if (s.key === "transcribe" && isTranscribing) return "transcribing…";
    if (s.state === "done") return "✓ complete";
    if (s.key === "generate" && (simPhase === "running" || simPhase === "done")) return `${elapsed}s elapsed`;
    return s.time;
  };

  return (
    <div className="screen">
      <div className="processing-wrap">
        <div className="processing-card">
          <div className="processing-episode">PostPod · Processing</div>

          <h2 className="processing-title">
            <span>{activeStage.label}</span>
            <span className="dots" />
          </h2>

          <p className="processing-desc">"{episodeName}"</p>

          <div className="stages">
            {stageStates.map((s) => (
              <div
                key={s.key}
                className={`stage ${s.state === "active" && isTranscribing && s.key === "transcribe" ? "active transcribing" : s.state}`}
              >
                <div className="stage-dot">
                  {s.state === "done" && <IconCheck size={12} stroke={2.5} />}
                </div>
                <div className="stage-label">{s.label}</div>
                <div className="stage-time">{stageLabel(s)}</div>
              </div>
            ))}
          </div>

          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 10,
              fontSize: 12,
              color: "var(--text-dim)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span>
              {isTranscribing
                ? `Transcribing · ${elapsed}s elapsed`
                : `${Math.round(progress)}% · ${elapsed}s elapsed`}
            </span>
            <span>Please don&apos;t close this window</span>
          </div>

          {isTranscribing && (
            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                color: "var(--text-dim)",
                textAlign: "center",
              }}
            >
              This takes 2–5 minutes. Grab a coffee and we&apos;ll have your assets ready when you&apos;re back.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
