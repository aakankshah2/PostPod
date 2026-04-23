"use client";

import { useState, useEffect } from "react";
import { IconCheck } from "@/components/icons";

const STAGES = [
  { key: "transcribe", label: "Transcribing audio",              weight: 35, time: "12s" },
  { key: "analyze",   label: "Analyzing content & structure",   weight: 40, time: "18s" },
  { key: "generate",  label: "Generating outputs",              weight: 25, time: "14s" },
] as const;

type Props = {
  episodeName: string;
  onComplete: () => void;
  durationMs?: number;
};

export function ProcessingScreen({ episodeName, onComplete, durationMs = 6000 }: Props) {
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    let raf: number;

    const tick = () => {
      const t = Date.now() - start;
      const p = Math.min(100, (t / durationMs) * 100);
      setProgress(p);
      setElapsed(Math.round(t / 1000));
      if (p < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(onComplete, 400);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [durationMs, onComplete]);

  let cumulative = 0;
  const stageStates = STAGES.map((s) => {
    const start = cumulative;
    const end = cumulative + s.weight;
    cumulative = end;
    const state = progress >= end ? "done" : progress >= start ? "active" : "pending";
    return { ...s, state, start, end };
  });

  const activeStage =
    stageStates.find((s) => s.state === "active") ??
    stageStates[stageStates.length - 1];

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
              <div key={s.key} className={`stage ${s.state}`}>
                <div className="stage-dot">
                  {s.state === "done" && <IconCheck size={12} stroke={2.5} />}
                </div>
                <div className="stage-label">{s.label}</div>
                <div className="stage-time">
                  {s.state === "done" ? "✓ complete" : s.time}
                </div>
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
              {Math.round(progress)}% · {elapsed}s elapsed
            </span>
            <span>Please don&apos;t close this window</span>
          </div>
        </div>
      </div>
    </div>
  );
}
