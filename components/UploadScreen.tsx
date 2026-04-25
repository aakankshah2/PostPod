"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
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
  isDemo: boolean;
  episodeId?: string;
  hasAudio?: boolean; // true when an MP3 was uploaded (needed to decide whether to transcribe)
};

type UploadProgress = { loaded: number; total: number };

type Props = {
  onSubmit: (data: EpisodeSubmitData) => void;
};

function fmtMB(bytes: number) {
  return (bytes / 1024 / 1024).toFixed(1);
}



export function UploadScreen({ onSubmit }: Props) {
  const generateUploadUrl = useMutation(api.episodes.generateUploadUrl);
  const createEpisode = useMutation(api.episodes.createEpisode);

  const [episodeName, setEpisodeName] = useState("");
  const [mp3, setMp3] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<File | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const mp3Ref = useRef<HTMLInputElement>(null);
  const txtRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const hasAudio = !!mp3 || isDemo;
  const hasPastedText = pasteText.trim().length > 0;
  const hasTranscript = !!transcript || hasPastedText || isDemo;
  const canSubmit = !isUploading && episodeName.trim().length > 3 && (hasAudio || hasTranscript);

  const demoFill = (e: React.MouseEvent) => {
    e.preventDefault();
    setEpisodeName("Naval Ravikant on Wealth, Happiness & Leverage");
    setIsDemo(true);
    setMp3(null);
    setTranscript(null);
    setPasteText("");
  };

  const handleMp3Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setMp3(file);
    if (file) setIsDemo(false);
  };

  const handleTxtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setTranscript(file);
    if (file) {
      setIsDemo(false);
      setPasteText("");
    }
  };

  const handlePasteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPasteText(e.target.value);
    if (e.target.value) {
      setIsDemo(false);
      setTranscript(null);
    }
  };

  const handleCancel = () => {
    xhrRef.current?.abort();
    xhrRef.current = null;
    setIsUploading(false);
    setUploadProgress(null);
    setUploadError(null);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setUploadError(null);

    if (isDemo) {
      onSubmit({ title: episodeName.trim(), isDemo: true });
      return;
    }

    setIsUploading(true);
    try {
      let audioStorageId: Id<"_storage"> | undefined;
      let transcriptText: string | undefined;

      if (mp3) {
        const uploadUrl = await generateUploadUrl({});
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        const storageId = await new Promise<string>((resolve, reject) => {
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) setUploadProgress({ loaded: e.loaded, total: e.total });
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const { storageId: sid } = JSON.parse(xhr.responseText);
              resolve(sid);
            } else {
              reject(new Error(`Upload failed (${xhr.status})`));
            }
          };
          xhr.onerror = () => reject(new Error("Network error"));
          xhr.onabort = () => reject(new Error("CANCELLED"));
          xhr.open("POST", uploadUrl);
          xhr.setRequestHeader("Content-Type", mp3.type || "audio/mpeg");
          xhr.send(mp3);
        });

        audioStorageId = storageId as Id<"_storage">;
        setUploadProgress(null);
      }

      if (transcript) {
        transcriptText = await transcript.text();
      } else if (pasteText.trim()) {
        transcriptText = pasteText.trim();
      }

      const episodeId = await createEpisode({
        title: episodeName.trim(),
        audioStorageId,
        transcript: transcriptText,
      });

      onSubmit({ title: episodeName.trim(), isDemo: false, episodeId: episodeId as string, hasAudio: !!mp3 });
    } catch (err) {
      if (err instanceof Error && err.message === "CANCELLED") return;
      setUploadError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      xhrRef.current = null;
    }
  };

  const pct = uploadProgress
    ? Math.round((uploadProgress.loaded / uploadProgress.total) * 100)
    : 0;

  const mp3Label = mp3
    ? `${mp3.name} · ${fmtMB(mp3.size)} MB`
    : isDemo
    ? "naval-ep47-raw.mp3 · 48.2 MB"
    : "Audio file · up to 500MB";

  const txtLabel = transcript
    ? transcript.name
    : hasPastedText
    ? `Text pasted · ${pasteText.trim().length.toLocaleString()} chars`
    : isDemo
    ? "naval-transcript.txt · 124 KB"
    : ".txt file · or paste text below";

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
            disabled={isUploading}
          />

          <div className="upload-row">
            {/* MP3 button */}
            <button
              className={`upload-btn ${hasAudio ? "has-file" : ""}`}
              onClick={() => !isUploading && mp3Ref.current?.click()}
              type="button"
              disabled={isUploading}
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
              onClick={() => !isUploading && txtRef.current?.click()}
              type="button"
              disabled={isUploading}
            >
              <div className="upload-btn-icon">
                {hasTranscript ? <IconCheck size={16} /> : <IconFile size={16} />}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="upload-btn-label">
                  {hasTranscript ? "Transcript ready" : "Upload Transcript"}
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

          {/* Upload progress — shown only while XHR is in flight */}
          {uploadProgress && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Track */}
              <div
                style={{
                  height: 4,
                  borderRadius: 2,
                  background: "var(--border)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: "var(--accent)",
                    borderRadius: 2,
                    transition: "width 0.15s ease",
                  }}
                />
              </div>
              {/* Labels + cancel */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 12,
                  color: "var(--text-muted)",
                }}
              >
                <span>
                  {pct}% &nbsp;·&nbsp; {fmtMB(uploadProgress.loaded)} / {fmtMB(uploadProgress.total)} MB
                </span>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    color: "var(--danger)",
                    padding: 0,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Paste toggle — hidden while uploading */}
          {!isUploading && (
            <div style={{ textAlign: "center" }}>
              <button
                type="button"
                onClick={() => setShowPaste(!showPaste)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  color: showPaste ? "var(--text-muted)" : "var(--accent)",
                  padding: "4px 0",
                }}
              >
                {showPaste ? "Hide paste area ↑" : "Or paste transcript text ↓"}
              </button>
            </div>
          )}

          {showPaste && !isUploading && (
            <textarea
              placeholder="Paste your transcript here…"
              value={pasteText}
              onChange={handlePasteChange}
              style={{
                width: "100%",
                minHeight: 140,
                background: "var(--bg-input)",
                border: "1px solid var(--border-soft)",
                borderRadius: "var(--radius)",
                padding: "12px 14px",
                fontSize: 13,
                color: "var(--text)",
                fontFamily: "var(--font-mono)",
                lineHeight: 1.55,
                resize: "vertical",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--text-muted)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-soft)")}
            />
          )}

          {uploadError && (
            <p style={{ fontSize: 13, color: "var(--danger)", margin: 0, textAlign: "center" }}>
              {uploadError}
            </p>
          )}

          <button
            className="submit-btn"
            disabled={!canSubmit}
            onClick={handleSubmit}
            type="button"
          >
            {isUploading && !uploadProgress
              ? "Saving episode…"
              : isUploading
              ? "Uploading…"
              : <>Generate publish-ready assets <IconArrow size={16} /></>}
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
