"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, FormEvent } from "react";

type FormState = "idle" | "loading" | "success" | "duplicate" | "error";

/* ─── Shared token ─────────────────────────────────────────── */
const sectionLabel: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--color-muted)",
  margin: 0,
};

/* ─── Wordmark ─────────────────────────────────────────────── */
function Wordmark() {
  return (
    <div
      style={{
        position: "absolute",
        top: "32px",
        left: "clamp(24px, 4vw, 48px)",
        fontFamily: "var(--font-sans)",
        fontWeight: 600,
        fontSize: "20px",
        letterSpacing: "-0.02em",
        color: "var(--color-text)",
        lineHeight: 1,
        userSelect: "none",
      }}
    >
      Post
      <span style={{ position: "relative", display: "inline-block" }}>
        Pod
        <span
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: "100%",
            height: "2px",
            backgroundColor: "var(--color-accent)",
          }}
        />
      </span>
    </div>
  );
}

/* ─── Form ─────────────────────────────────────────────────── */
function FormFields({
  onSuccess,
  onDuplicate,
}: {
  onSuccess: () => void;
  onDuplicate: () => void;
}) {
  const addToWaitlist = useMutation(api.waitlist.addToWaitlist);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<Exclude<FormState, "success">>("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      await addToWaitlist({ email });
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("ALREADY_ON_LIST")) {
        setState("idle");
        onDuplicate();
      } else {
        setState("error");
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        width: "100%",
        gap: "10px",
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        disabled={state === "loading"}
        style={{
          flex: "1 1 220px",
          maxWidth: "300px",
          padding: "14px 18px",
          border: "1px solid var(--color-border)",
          borderRadius: "6px",
          fontSize: "16px",
          fontFamily: "var(--font-sans)",
          color: "var(--color-text)",
          backgroundColor: "transparent",
          outline: "none",
          transition: "border-color 0.15s ease",
          opacity: state === "loading" ? 0.5 : 1,
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
      />
      <button
        type="submit"
        disabled={state === "loading"}
        style={{
          flex: "0 0 auto",
          padding: "14px 26px",
          backgroundColor:
            state === "loading"
              ? "var(--color-accent-hover)"
              : "var(--color-accent)",
          color: "#000000",
          border: "none",
          borderRadius: "6px",
          fontSize: "16px",
          fontWeight: 600,
          fontFamily: "var(--font-sans)",
          cursor: state === "loading" ? "not-allowed" : "pointer",
          transition: "background-color 0.15s ease, transform 0.1s ease",
          whiteSpace: "nowrap",
          letterSpacing: "-0.01em",
        }}
        onMouseEnter={(e) => {
          if (state !== "loading")
            e.currentTarget.style.backgroundColor = "var(--color-accent-hover)";
        }}
        onMouseLeave={(e) => {
          if (state !== "loading")
            e.currentTarget.style.backgroundColor = "var(--color-accent)";
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {state === "loading" ? "Joining…" : "Join Waitlist"}
      </button>

      {state === "error" && (
        <p
          style={{
            width: "100%",
            fontSize: "14px",
            color: "#ef4444",
            margin: "4px 0 0",
            textAlign: "center",
          }}
        >
          Something went wrong. Try again in a moment.
        </p>
      )}
    </form>
  );
}

/* ─── How it works ─────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    {
      num: "01",
      heading: "Upload your episode.",
      body: "Drop in any podcast video. MP4, MOV, up to two hours.",
    },
    {
      num: "02",
      heading: "PostPod listens and writes.",
      body: "It watches the whole episode, finds the moments that matter, and writes in your voice.",
    },
    {
      num: "03",
      heading: "Publish everywhere.",
      body: "Get timestamps, 8 pull quotes, a LinkedIn post, YouTube chapters, and 3 click-tested titles. Copy, paste, ship.",
    },
  ];

  return (
    <section
      style={{
        width: "100%",
        maxWidth: "720px",
        margin: "0 auto",
        padding: "160px clamp(24px, 6vw, 48px) 0",
      }}
    >
      <p style={{ ...sectionLabel, marginBottom: "48px" }}>How it works</p>
      <ol
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: "120px",
        }}
      >
        {steps.map(({ num, heading, body }) => (
          <li key={num}>
            {/* Big number sits behind heading via negative bottom margin */}
            <div
              style={{
                fontSize: "64px",
                fontWeight: 500,
                color: "var(--color-num)",
                lineHeight: 1,
                letterSpacing: "-0.04em",
                fontFamily: "var(--font-sans)",
                marginBottom: "-14px",
              }}
            >
              {num}
            </div>
            <h3
              style={{
                fontSize: "28px",
                fontWeight: 600,
                color: "var(--color-text)",
                margin: "0 0 12px",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                fontFamily: "var(--font-sans)",
                position: "relative",
              }}
            >
              {heading}
            </h3>
            <p
              style={{
                fontSize: "18px",
                color: "var(--color-muted)",
                margin: 0,
                lineHeight: 1.6,
                maxWidth: "480px",
              }}
            >
              {body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ─── Built for ────────────────────────────────────────────── */
function BuiltFor() {
  const lines = [
    "Podcast hosts who hate the post-production tax.",
    "Solo operators running a show without a social media team.",
    "Agencies repackaging client episodes at scale.",
  ];

  return (
    <section
      style={{
        width: "100%",
        maxWidth: "720px",
        margin: "0 auto",
        padding: "160px clamp(24px, 6vw, 48px) 0",
      }}
    >
      <p style={{ ...sectionLabel, marginBottom: "48px" }}>Built for</p>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          borderTop: "1px solid var(--color-divider)",
        }}
      >
        {lines.map((line) => (
          <li
            key={line}
            style={{
              padding: "24px 0",
              fontSize: "20px",
              color: "var(--color-text)",
              lineHeight: 1.4,
              borderBottom: "1px solid var(--color-divider)",
              letterSpacing: "-0.01em",
            }}
          >
            {line}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ─── Footer ───────────────────────────────────────────────── */
function Footer() {
  return (
    <footer
      style={{
        padding: "120px 24px 60px",
        textAlign: "center",
        fontSize: "14px",
        color: "var(--color-muted)",
        letterSpacing: "0.02em",
      }}
    >
      PostPod · Coming 2026
    </footer>
  );
}

/* ─── Page ─────────────────────────────────────────────────── */
export function WaitlistPage() {
  const [formState, setFormState] = useState<"idle" | "success" | "duplicate">(
    "idle"
  );

  return (
    <>
      {/* ── Section 1: Hero ── */}
      <section
        style={{
          minHeight: "100svh",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(88px, 12vh, 120px) clamp(24px, 6vw, 48px) clamp(64px, 8vh, 96px)",
        }}
      >
        <Wordmark />

        <div
          style={{
            width: "100%",
            maxWidth: "720px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* Display headline */}
          <h1
            className="animate-fade-up delay-1"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(48px, 8vw, 96px)",
              fontWeight: 600,
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              color: "var(--color-text)",
              margin: "0 0 48px",
            }}
          >
            Turn every podcast episode into a{" "}
            <span style={{ color: "var(--color-accent)" }}>week</span>
            {" "}of content.
          </h1>

          {/* Subheadline */}
          <p
            className="animate-fade-up delay-2"
            style={{
              fontSize: "20px",
              fontWeight: 400,
              color: "var(--color-muted)",
              lineHeight: 1.5,
              margin: "0 0 48px",
              maxWidth: "560px",
            }}
          >
            Upload your episode once. Get timestamps, pull quotes, a LinkedIn
            post, YouTube chapters, and three click-tested titles — in minutes.
          </p>

          {/* Form area */}
          <div
            className="animate-fade-up delay-3"
            style={{
              width: "100%",
              maxWidth: "560px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            {formState === "success" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  fontSize: "20px",
                  color: "var(--color-text)",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    color: "var(--color-accent)",
                    lineHeight: 1.4,
                    flexShrink: 0,
                  }}
                >
                  •
                </span>
                <span>
                  You&apos;re on the list. We&apos;ll email you when PostPod opens up.
                </span>
              </div>
            ) : (
              <>
                <FormFields
                  onSuccess={() => setFormState("success")}
                  onDuplicate={() => setFormState("duplicate")}
                />

                {formState === "duplicate" && (
                  <p
                    style={{
                      fontSize: "14px",
                      color: "var(--color-muted)",
                      margin: 0,
                    }}
                  >
                    You&apos;re already on the list — we&apos;ll email you at launch.
                  </p>
                )}

                <p
                  className="animate-fade-up delay-4"
                  style={{
                    fontSize: "14px",
                    color: "var(--color-muted)",
                    margin: 0,
                  }}
                >
                  No spam. One email when we launch.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Section 2: Demo video thumbnail ── */}
      <section
        style={{
          width: "100%",
          maxWidth: "720px",
          margin: "0 auto",
          padding: "0 clamp(24px, 6vw, 48px)",
        }}
      >
        <a
          href="https://youtu.be/F-9mls5w16A"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            position: "relative",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid var(--color-border)",
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          {/* Thumbnail */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://img.youtube.com/vi/F-9mls5w16A/maxresdefault.jpg"
            alt="PostPod demo video"
            style={{ display: "block", width: "100%", aspectRatio: "16/9", objectFit: "cover" }}
          />

          {/* Dark overlay */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            transition: "background 0.2s ease",
          }} />

          {/* Play button */}
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
          }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "var(--color-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 32px rgba(245,197,24,0.4)",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#000">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
            <span style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#ffffff",
              letterSpacing: "-0.01em",
              textShadow: "0 1px 4px rgba(0,0,0,0.6)",
            }}>
              Watch the demo
            </span>
          </div>
        </a>
      </section>

      {/* ── Sections 3–5 ── */}
      <HowItWorks />
      <BuiltFor />
      <Footer />
    </>
  );
}
