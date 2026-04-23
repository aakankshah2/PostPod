"use client";

import { useState, useRef } from "react";
import {
  IconCheck,
  IconMic,
  IconFile,
  IconArrow,
  IconShield,
  IconClock,
} from "@/components/icons";

export type EpisodeSubmitData = {
  title: string;
  mp3: File | null;
  transcript: File | null;
  isDemo: boolean;
};

type Props = {
  onSubmit: (data: EpisodeSubmitData) => void;
};

export function UploadScreen({ onSubmit }: Props) {
  const [episodeName, setEpisodeName] = useState("");
  const [mp3, setMp3] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<File | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const mp3Ref = useRef<HTMLInputElement>(null);
  const txtRef = useRef<HTMLInputElement>(null);

  const hasAudio = mp3 || isDemo;
  const hasTranscript = transcript || isDemo;
  const canSubmit = episodeName.trim().length > 3 && (hasAudio || hasTranscript);

  const demoFill = (e: React.MouseEvent) => {
    e.preventDefault();
    setEpisodeName("Naval Ravikant on Wealth, Happiness & Leverage");
    setIsDemo(true);
  };

  const handleMp3Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setMp3(file);
    if (file) setIsDemo(false);
  };

  const handleTxtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setTranscript(file);
    if (file) setIsDemo(false);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ title: episodeName.trim(), mp3, transcript, isDemo });
  };

  const mp3Label = mp3
    ? `${mp3.name} · ${(mp3.size / 1024 / 1024).toFixed(1)} MB`
    : isDemo
    ? "naval-ep47-raw.mp3 · 48.2 MB"
    : "Audio file · up to 500MB";

  const txtLabel = transcript
    ? transcript.name
    : isDemo
    ? "naval-transcript.txt · 124 KB"
    : ".txt file · or paste text";

  return (
    <div className="screen">
      <div className="ghost-wordmark">postpod</div>

      <div className="upload-wrap">
        <span className="eyebrow">For podcast hosts · v1.0</span>

        <h1 className="hero-title">
          Turn a raw episode into <em>publish-ready</em> assets.
        </h1>

        <p className="hero-sub">
          Drop your MP3 or transcript. In under a minute*, PostPod writes your
          titles, chapters, pull quotes, LinkedIn post, and timestamps.
        </p>

        <div className="upload-card">
          <input
            className="episode-input"
            placeholder="Episode name — e.g. Naval on wealth and leverage (raw)"
            value={episodeName}
            onChange={(e) => setEpisodeName(e.target.value)}
          />

          <div className="upload-row">
            {/* MP3 button */}
            <button
              className={`upload-btn ${hasAudio ? "has-file" : ""}`}
              onClick={() => mp3Ref.current?.click()}
              type="button"
            >
              <div className="upload-btn-icon">
                {hasAudio ? <IconCheck size={16} /> : <IconMic size={16} />}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="upload-btn-label">
                  {hasAudio ? "MP3 uploaded" : "Upload MP3"}
                </div>
                <div className="upload-btn-hint">{mp3Label}</div>
              </div>
              <input
                ref={mp3Ref}
                type="file"
                accept=".mp3,audio/*"
                onChange={handleMp3Change}
                style={{ display: "none" }}
              />
            </button>

            {/* Transcript button */}
            <button
              className={`upload-btn ${hasTranscript ? "has-file" : ""}`}
              onClick={() => txtRef.current?.click()}
              type="button"
            >
              <div className="upload-btn-icon">
                {hasTranscript ? <IconCheck size={16} /> : <IconFile size={16} />}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="upload-btn-label">
                  {hasTranscript ? "Transcript uploaded" : "Paste / Upload Transcript"}
                </div>
                <div className="upload-btn-hint">{txtLabel}</div>
              </div>
              <input
                ref={txtRef}
                type="file"
                accept=".txt,text/plain"
                onChange={handleTxtChange}
                style={{ display: "none" }}
              />
            </button>
          </div>

          <button
            className="submit-btn"
            disabled={!canSubmit}
            onClick={handleSubmit}
            type="button"
          >
            Generate publish-ready assets <IconArrow size={16} />
          </button>
        </div>

        <div className="upload-foot">
          <span>
            <IconShield size={14} /> Files never leave your workspace
          </span>
          <span>
            <IconClock size={14} /> ~45 sec for a 45-min episode
          </span>
          <span>
            <a
              href="#"
              onClick={demoFill}
              style={{
                color: "var(--accent)",
                textDecoration: "underline",
                textDecorationColor: "transparent",
                textUnderlineOffset: "2px",
                transition: "text-decoration-color 0.15s",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.textDecorationColor = "currentColor")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.textDecorationColor = "transparent")
              }
            >
              Try with demo episode →
            </a>
          </span>
        </div>

        <p className="hero-disclaimer">
          <span className="asterisk">*</span> Processing time varies with file
          size and length. Typical episodes (30–60 min) finish in under a
          minute; longer or higher-bitrate files may take a few minutes.
        </p>
      </div>
    </div>
  );
}
