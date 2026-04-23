"use client";

import { useState } from "react";
import type { DemoOutputs } from "@/lib/demoData";
import {
  IconArrowLeft,
  IconDownload,
  IconLock,
  IconSparkle,
  IconLinkedIn,
  IconClock,
  IconYouTube,
  IconQuote,
  IconCopy,
  IconChevron,
  IconCheck,
} from "@/components/icons";

type Props = {
  data: DemoOutputs & { episodeName: string };
  unlocked: boolean;
  onUnlock: () => void;
  onHome: () => void;
  showToast: (msg: string) => void;
};

const SECTIONS = [
  { id: "titles",     title: "Top 3 publishable titles",       sub: "Ranked for hookability & CTR",          icon: IconSparkle,  locked: false },
  { id: "linkedin",   title: "LinkedIn post",                  sub: "First-person, ready to publish",        icon: IconLinkedIn, locked: false },
  { id: "timestamps", title: "Episode timestamps",             sub: "moments identified",                    icon: IconClock,    locked: true  },
  { id: "chapters",   title: "YouTube chapters",               sub: "chapters · YT-formatted",              icon: IconYouTube,  locked: true  },
  { id: "quotes",     title: "Pull quotes",                    sub: "quotes for socials & carousels",        icon: IconQuote,    locked: true  },
] as const;

type SectionId = typeof SECTIONS[number]["id"];

export function OutputsScreen({ data, unlocked, onUnlock, onHome, showToast }: Props) {
  const [openIds, setOpenIds] = useState<Set<SectionId>>(
    new Set(["titles", "linkedin"])
  );
  const [copiedId, setCopiedId] = useState<SectionId | null>(null);

  const toggle = (id: SectionId) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const copyText = (text: string, id: SectionId, label: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
    showToast(`${label} copied`);
  };

  const getTextForCopy = (id: SectionId): string => {
    switch (id) {
      case "titles":
        return data.titles.map((t, i) => `${i + 1}. ${t.text} (${t.score}/100)`).join("\n");
      case "linkedin":
        return data.linkedinPost;
      case "timestamps":
        return data.timestamps.map((t) => `${t.time}  ${t.label}`).join("\n");
      case "chapters":
        return data.chapters.map((t) => `${t.time} ${t.label}`).join("\n");
      case "quotes":
        return data.quotes.map((q, i) => `${i + 1}. "${q.text}" — ${q.ts}`).join("\n\n");
    }
  };

  const buildAllText = () =>
    [
      `# ${data.episodeName}`,
      `Duration: ${data.duration} · Words: ${data.wordCount.toLocaleString()}`,
      ``,
      `## Top 3 titles`,
      data.titles.map((t, i) => `${i + 1}. ${t.text}`).join("\n"),
      ``,
      `## LinkedIn post`,
      data.linkedinPost,
      ``,
      `## Timestamps`,
      data.timestamps.map((t) => `${t.time}  ${t.label}`).join("\n"),
      ``,
      `## YouTube chapters`,
      data.chapters.map((t) => `${t.time} ${t.label}`).join("\n"),
      ``,
      `## Pull quotes`,
      data.quotes.map((q, i) => `${i + 1}. "${q.text}" — ${q.ts}`).join("\n\n"),
    ].join("\n");

  const downloadAll = () => {
    const text = buildAllText();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.episodeName.replace(/[^\w]+/g, "-").toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("Downloaded full output .txt");
  };

  const lockedCount = SECTIONS.filter((s) => s.locked && !unlocked).length;

  const renderBody = (id: SectionId) => {
    switch (id) {
      case "titles":
        return (
          <div className="titles-list">
            {data.titles.map((t, i) => (
              <div className="title-item" key={i}>
                <div className="title-rank">0{i + 1}</div>
                <div className="title-text">{t.text}</div>
                <div className="title-score">{t.score}/100 hook</div>
              </div>
            ))}
          </div>
        );
      case "linkedin":
        return (
          <>
            <div className="linkedin-post">{data.linkedinPost}</div>
            <div className="linkedin-meta">
              <span>{data.linkedinPost.length} chars</span>
              <span>~{data.linkedinPost.split(/\s+/).length} words</span>
              <span>Est. 38s read</span>
            </div>
          </>
        );
      case "timestamps":
        return (
          <div className="ts-list">
            {data.timestamps.map((t, i) => (
              <div className="ts-row" key={i}>
                <div className="ts-time">{t.time}</div>
                <div className="ts-label">{t.label}</div>
                <div className="ts-dur">{t.dur}</div>
              </div>
            ))}
          </div>
        );
      case "chapters":
        return (
          <div className="ts-list">
            {data.chapters.map((t, i) => (
              <div className="ts-row" key={i}>
                <div className="ts-time">{t.time}</div>
                <div className="ts-label">{t.label}</div>
                <div className="ts-dur">{t.dur}</div>
              </div>
            ))}
          </div>
        );
      case "quotes":
        return (
          <div className="quotes-grid">
            {data.quotes.map((q, i) => (
              <div className="quote-card" key={i}>
                <div className="quote-mark">&ldquo;</div>
                <div className="quote-text">{q.text}</div>
                <div className="quote-foot">
                  <span>{q.ts} · best for {q.fit}</span>
                  <div className="quote-actions">
                    <button className="quote-act">Tweet</button>
                    <button className="quote-act">Image</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div
      className="screen"
      style={{ alignItems: "stretch", padding: "24px 32px 80px" }}
    >
      <div className="outputs-wrap">
        <div style={{ marginBottom: 28 }}>
          <button className="back-home" onClick={onHome}>
            <IconArrowLeft size={14} /> Home
          </button>
        </div>

        <div className="outputs-header">
          <div className="outputs-meta">
            <div className="outputs-eyebrow">Processing complete · 44s</div>
            <h1 className="outputs-title">{data.episodeName}</h1>
            <div className="outputs-sub">
              <span>Duration {data.duration}</span>
              <span>·</span>
              <span>{data.wordCount.toLocaleString()} words</span>
              <span>·</span>
              <span>5 output formats</span>
            </div>
          </div>
          <div className="outputs-actions">
            <button
              className="btn-ghost"
              onClick={downloadAll}
              disabled={!unlocked}
            >
              <IconDownload size={14} /> Download all .txt
            </button>
          </div>
        </div>

        {!unlocked && lockedCount > 0 && (
          <div className="unlock-banner">
            <div className="unlock-banner-icon">
              <IconLock size={18} />
            </div>
            <div className="unlock-banner-text">
              <div className="unlock-banner-title">
                Unlock all {SECTIONS.length} outputs for this episode
              </div>
              <div className="unlock-banner-sub">
                Titles & LinkedIn post are free. {lockedCount} more outputs
                available with full access.
              </div>
            </div>
            <button className="unlock-btn" onClick={onUnlock}>
              Unlock for ₹299
            </button>
          </div>
        )}

        <div className="output-list">
          {SECTIONS.map((s, i) => {
            const isOpen = openIds.has(s.id);
            const isLocked = s.locked && !unlocked;
            const isCopied = copiedId === s.id;
            const SectionIcon = s.icon;
            const subText =
              s.id === "timestamps"
                ? `${data.timestamps.length} ${s.sub}`
                : s.id === "chapters"
                ? `${data.chapters.length} ${s.sub}`
                : s.id === "quotes"
                ? `${data.quotes.length} ${s.sub}`
                : s.sub;

            return (
              <div
                key={s.id}
                className={`output-card ${isOpen ? "open" : ""} ${
                  isLocked ? "locked" : "unlocked"
                }`}
              >
                <div className="output-head" onClick={() => toggle(s.id)}>
                  <div className="output-num">0{i + 1}</div>
                  <div className="output-meta">
                    <div className="output-title">
                      {s.title}
                      {isLocked ? (
                        <span className="output-lock-tag">Locked</span>
                      ) : (
                        <span className="output-free-tag">Free</span>
                      )}
                    </div>
                    <div className="output-sub">{subText}</div>
                  </div>
                  <div className="output-actions">
                    {!isLocked && (
                      <button
                        className={`icon-btn ${isCopied ? "copied" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          copyText(getTextForCopy(s.id), s.id, s.title);
                        }}
                        title="Copy to clipboard"
                      >
                        {isCopied ? (
                          <IconCheck size={15} />
                        ) : (
                          <IconCopy size={15} />
                        )}
                      </button>
                    )}
                    {isLocked && (
                      <button
                        className="icon-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnlock();
                        }}
                        title="Unlock"
                      >
                        <IconLock size={15} />
                      </button>
                    )}
                    <div className="icon-btn">
                      <IconChevron className="chevron" size={16} />
                    </div>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ position: "relative" }}>
                    <div className={`output-body ${isLocked ? "blurred" : ""}`}>
                      {renderBody(s.id)}
                    </div>
                    {isLocked && (
                      <div className="lock-overlay">
                        <div className="lock-overlay-icon">
                          <IconLock size={18} />
                        </div>
                        <div className="lock-overlay-title">
                          Unlock this output for ₹299
                        </div>
                        <div className="lock-overlay-sub">
                          One-time payment unlocks timestamps, YouTube chapters
                          and all pull quotes for this episode.
                        </div>
                        <button className="unlock-btn" onClick={onUnlock}>
                          Unlock now
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
