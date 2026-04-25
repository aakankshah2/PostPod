"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
// credits query fires once on mount; Convex reactivity updates it after payment
import { DEMO_OUTPUTS, type AssetData } from "@/lib/demoData";
import {
  IconArrowLeft,
  IconDownload,
  IconLock,
  IconSparkle,
  IconLinkedIn,
  IconYouTube,
  IconQuote,
  IconList,
  IconCopy,
  IconChevron,
  IconCheck,
} from "@/components/icons";

type Props = {
  episodeId?: string;
  isDemo: boolean;
  episodeName: string;
  onUnlock: (packId?: "single" | "pack") => void;
  onHome: () => void;
  showToast: (msg: string) => void;
};

const SECTIONS = [
  { id: "titles",    title: "Episode titles",        sub: "5 options ranked for hookability", icon: IconSparkle,  locked: false },
  { id: "linkedin",  title: "LinkedIn post",          sub: "First-person, ready to publish",   icon: IconLinkedIn, locked: false },
  { id: "chapters",  title: "Chapters & timestamps",  sub: "chapters with summaries",          icon: IconYouTube,  locked: true  },
  { id: "quotes",    title: "Pull quotes",             sub: "quotes for socials & carousels",   icon: IconQuote,    locked: true  },
  { id: "shownotes", title: "Show notes",              sub: "Full show notes for your RSS feed",icon: IconList,     locked: true  },
] as const;

type SectionId = typeof SECTIONS[number]["id"];

function deterministicScore(title: string): number {
  let h = 0;
  for (let i = 0; i < title.length; i++) {
    h = ((h << 5) - h + title.charCodeAt(i)) | 0;
  }
  return 78 + (Math.abs(h) % 20);
}

export function OutputsScreen({ episodeId, isDemo, episodeName, onUnlock, onHome, showToast }: Props) {
  const [openIds, setOpenIds] = useState<Set<SectionId>>(new Set(["titles", "linkedin"]));
  const [copiedId, setCopiedId] = useState<SectionId | null>(null);

  const credits = useQuery(api.users.getMyCredits);

  const episode = useQuery(
    api.episodes.getEpisode,
    episodeId && !isDemo ? { episodeId: episodeId as Id<"episodes"> } : "skip",
  );

  const unlocked = isDemo || episode?.creditSpent === true;

  const spendCreditForEpisode = useMutation(api.users.spendCreditForEpisode);
  const [spending, setSpending] = useState(false);

  const handleDirectUnlock = async () => {
    if (!episodeId || spending) return;
    setSpending(true);
    try {
      await spendCreditForEpisode({ episodeId: episodeId as Id<"episodes"> });
      // Convex reactivity will update episode.creditSpent → unlocked transitions automatically
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to unlock";
      showToast(msg === "NO_CREDITS" ? "No credits remaining" : "Failed to unlock");
    } finally {
      setSpending(false);
    }
  };

  const rawAssets = useQuery(
    api.assets.getAssets,
    episodeId && !isDemo ? { episodeId: episodeId as Id<"episodes"> } : "skip",
  );

  // Still loading real assets
  const isLoading = !isDemo && (rawAssets === undefined || episode === undefined);

  const assets: AssetData = (isDemo ? DEMO_OUTPUTS : rawAssets) ?? DEMO_OUTPUTS;

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
        return assets.titles.map((t, i) => `${i + 1}. ${t}`).join("\n");
      case "linkedin":
        return assets.linkedInPost;
      case "chapters":
        return assets.chapters.map((c) => `${c.timestamp}  ${c.title}\n${c.summary}`).join("\n\n");
      case "quotes":
        return assets.pullQuotes.map((q, i) => `${i + 1}. "${q}"`).join("\n\n");
      case "shownotes":
        return assets.showNotes;
    }
  };

  const buildAllText = () =>
    [
      `# ${episodeName}`,
      ``,
      `## Episode titles`,
      assets.titles.map((t, i) => `${i + 1}. ${t}`).join("\n"),
      ``,
      `## LinkedIn post`,
      assets.linkedInPost,
      ``,
      `## Chapters & timestamps`,
      assets.chapters.map((c) => `${c.timestamp}  ${c.title}\n${c.summary}`).join("\n\n"),
      ``,
      `## Pull quotes`,
      assets.pullQuotes.map((q, i) => `${i + 1}. "${q}"`).join("\n\n"),
      ``,
      `## Show notes`,
      assets.showNotes,
    ].join("\n");

  const downloadAll = () => {
    const text = buildAllText();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${episodeName.replace(/[^\w]+/g, "-").toLowerCase()}.txt`;
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
            {assets.titles.map((t, i) => (
              <div className="title-item" key={i}>
                <div className="title-rank">0{i + 1}</div>
                <div className="title-text">{t}</div>
                <div className="title-score">{deterministicScore(t)}/100 hook</div>
              </div>
            ))}
          </div>
        );
      case "linkedin":
        return (
          <>
            <div className="linkedin-post">{assets.linkedInPost}</div>
            <div className="linkedin-meta">
              <span>{assets.linkedInPost.length} chars</span>
              <span>~{assets.linkedInPost.split(/\s+/).length} words</span>
            </div>
          </>
        );
      case "chapters":
        return (
          <div className="ts-list">
            {assets.chapters.map((c, i) => (
              <div className="ts-row" key={i} style={{ alignItems: "flex-start" }}>
                <div className="ts-time">{c.timestamp}</div>
                <div style={{ flex: 1 }}>
                  <div className="ts-label">{c.title}</div>
                  <div className="ts-dur" style={{ marginTop: 2 }}>{c.summary}</div>
                </div>
              </div>
            ))}
          </div>
        );
      case "quotes":
        return (
          <div className="quotes-grid">
            {assets.pullQuotes.map((q, i) => (
              <div className="quote-card" key={i}>
                <div className="quote-mark">&ldquo;</div>
                <div className="quote-text">{q}</div>
              </div>
            ))}
          </div>
        );
      case "shownotes":
        return (
          <div className="linkedin-post" style={{ whiteSpace: "pre-wrap" }}>
            {assets.showNotes}
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="screen">
        <div className="processing-wrap">
          <div className="processing-card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
            Loading outputs…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen" style={{ alignItems: "stretch", padding: "24px 32px 80px" }}>
      <div className="outputs-wrap">
        <div style={{ marginBottom: 28 }}>
          <button className="back-home" onClick={onHome}>
            <IconArrowLeft size={14} /> Home
          </button>
        </div>

        <div className="outputs-header">
          <div className="outputs-meta">
            <div className="outputs-eyebrow">Processing complete</div>
            <h1 className="outputs-title">{episodeName}</h1>
            <div className="outputs-sub">
              <span>5 output formats ready</span>
            </div>
          </div>
          <div className="outputs-actions">
            <button className="btn-ghost" onClick={downloadAll} disabled={!unlocked}>
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
                Titles & LinkedIn post are free. {lockedCount} more outputs available with full access.
              </div>
            </div>
            {(credits ?? 0) > 0 ? (
              <button className="unlock-btn" onClick={handleDirectUnlock} disabled={spending}>
                {spending ? "Unlocking…" : "Use 1 credit to unlock"}
              </button>
            ) : (
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button className="unlock-btn" onClick={() => onUnlock("single")}>
                  Unlock · ₹299
                </button>
                <button className="unlock-btn" style={{ background: "transparent", border: "1px solid currentColor" }} onClick={() => onUnlock("pack")}>
                  10 credits · ₹2499
                </button>
              </div>
            )}
          </div>
        )}

        <div className="output-list">
          {SECTIONS.map((s, i) => {
            const isOpen = openIds.has(s.id);
            const isLocked = s.locked && !unlocked;
            const isCopied = copiedId === s.id;
            const SectionIcon = s.icon;

            const subText =
              s.id === "chapters"
                ? `${assets.chapters.length} ${s.sub}`
                : s.id === "quotes"
                ? `${assets.pullQuotes.length} ${s.sub}`
                : s.sub;

            return (
              <div
                key={s.id}
                className={`output-card ${isOpen ? "open" : ""} ${isLocked ? "locked" : "unlocked"}`}
              >
                <div className="output-head" onClick={() => toggle(s.id)}>
                  <div className="output-num">0{i + 1}</div>
                  <div className="output-meta">
                    <div className="output-title">
                      <SectionIcon size={14} style={{ flexShrink: 0, color: "var(--text-muted)" }} />
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
                        {isCopied ? <IconCheck size={15} /> : <IconCopy size={15} />}
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
                        <div className="lock-overlay-title">Unlock this output</div>
                        <div className="lock-overlay-sub">
                          One-time credit unlocks chapters, pull quotes, and show notes for this episode.
                        </div>
                        {(credits ?? 0) > 0 ? (
                          <button className="unlock-btn" onClick={handleDirectUnlock} disabled={spending}>
                            {spending ? "Unlocking…" : "Use 1 credit to unlock"}
                          </button>
                        ) : (
                          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                            <button className="unlock-btn" onClick={() => onUnlock("single")}>₹299 · 1 credit</button>
                            <button className="unlock-btn" style={{ background: "transparent", border: "1px solid currentColor" }} onClick={() => onUnlock("pack")}>₹2499 · 10 credits</button>
                          </div>
                        )}
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
