"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, FormEvent } from "react";

type FormState = "idle" | "loading" | "success" | "duplicate" | "error";

const S = {
  label: {
    fontSize: "0.6875rem",
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: "var(--color-muted)",
  },
} as const;

function Wordmark() {
  return (
    <div
      className="animate-fade-up"
      style={{
        fontFamily: "var(--font-body)",
        fontWeight: 600,
        fontSize: "0.875rem",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--color-text)",
      }}
    >
      Post
      <span style={{ position: "relative", display: "inline-block" }}>
        Pod
        <span
          style={{
            position: "absolute",
            left: 0,
            bottom: "-3px",
            width: "100%",
            height: "2px",
            backgroundColor: "var(--color-accent)",
            borderRadius: "1px",
          }}
        />
      </span>
    </div>
  );
}

function Features() {
  const items = [
    {
      label: "Timestamps & Chapters",
      copy: "Auto-generated from your episode, ready to paste into YouTube.",
    },
    {
      label: "Pull Quotes",
      copy: "Eight shareable moments, written for Twitter and carousels.",
    },
    {
      label: "Titles",
      copy: "Three hook-tested episode names built for click-through.",
    },
  ];

  return (
    <ul
      className="animate-fade-up delay-3"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        width: "100%",
        maxWidth: "460px",
        textAlign: "left",
        listStyle: "none",
        padding: 0,
        margin: 0,
      }}
    >
      {items.map(({ label, copy }) => (
        <li key={label} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          <span style={S.label}>{label}</span>
          <span style={{ fontSize: "0.9375rem", color: "var(--color-text)", lineHeight: 1.5 }}>
            {copy}
          </span>
        </li>
      ))}
    </ul>
  );
}

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
      style={{ display: "flex", width: "100%", gap: "10px", flexWrap: "wrap" }}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        disabled={state === "loading"}
        style={{
          flex: "1 1 200px",
          padding: "12px 16px",
          border: "1.5px solid var(--color-border)",
          borderRadius: "8px",
          fontSize: "0.9375rem",
          fontFamily: "var(--font-body)",
          color: "var(--color-text)",
          backgroundColor: "#fff",
          outline: "none",
          transition: "border-color 0.15s ease, box-shadow 0.15s ease",
          opacity: state === "loading" ? 0.5 : 1,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--color-accent)";
          e.target.style.boxShadow = "0 0 0 3px rgba(245, 197, 24, 0.15)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--color-border)";
          e.target.style.boxShadow = "none";
        }}
      />
      <button
        type="submit"
        disabled={state === "loading"}
        style={{
          flex: "0 0 auto",
          padding: "12px 22px",
          backgroundColor:
            state === "loading" ? "var(--color-accent-hover)" : "var(--color-accent)",
          color: "#0A0A0A",
          border: "none",
          borderRadius: "8px",
          fontSize: "0.9375rem",
          fontWeight: 600,
          fontFamily: "var(--font-body)",
          cursor: state === "loading" ? "not-allowed" : "pointer",
          transition: "background-color 0.15s ease, transform 0.1s ease",
          whiteSpace: "nowrap",
          letterSpacing: "0.01em",
        }}
        onMouseEnter={(e) => {
          if (state !== "loading")
            e.currentTarget.style.backgroundColor = "var(--color-accent-hover)";
        }}
        onMouseLeave={(e) => {
          if (state !== "loading")
            e.currentTarget.style.backgroundColor = "var(--color-accent)";
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = "scale(0.98)";
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        {state === "loading" ? "Joining…" : "Get Early Access"}
      </button>
      {state === "error" && (
        <p style={{ width: "100%", fontSize: "0.875rem", color: "#dc2626", margin: "4px 0 0" }}>
          Something went wrong. Try again in a moment.
        </p>
      )}
    </form>
  );
}

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
        padding: "0 24px 88px",
        margin: "0 auto",
      }}
    >
      <p style={{ ...S.label, margin: "0 0 52px" }}>How it works</p>
      <ol
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: "48px",
        }}
      >
        {steps.map(({ num, heading, body }) => (
          <li key={num} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <span
              style={{
                fontSize: "0.8125rem",
                color: "#C4C4C4",
                letterSpacing: "0.04em",
                marginBottom: "4px",
                fontFamily: "var(--font-body)",
              }}
            >
              {num}
            </span>
            <strong
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "var(--color-text)",
                lineHeight: 1.3,
              }}
            >
              {heading}
            </strong>
            <span
              style={{
                fontSize: "0.9375rem",
                color: "var(--color-muted)",
                lineHeight: 1.65,
                maxWidth: "480px",
              }}
            >
              {body}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

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
        padding: "0 24px 96px",
        margin: "0 auto",
      }}
    >
      <p style={{ ...S.label, margin: "0 0 24px" }}>Built for</p>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          borderTop: "1px solid var(--color-border)",
        }}
      >
        {lines.map((line) => (
          <li
            key={line}
            style={{
              padding: "20px 0",
              fontSize: "1rem",
              color: "var(--color-text)",
              lineHeight: 1.4,
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            {line}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--color-border)",
        padding: "28px 24px",
        textAlign: "center",
        fontSize: "0.8125rem",
        color: "var(--color-muted)",
        letterSpacing: "0.01em",
      }}
    >
      PostPod · Coming 2026
    </footer>
  );
}

export function WaitlistPage() {
  const [formState, setFormState] = useState<"idle" | "success" | "duplicate">("idle");

  return (
    <>
      {/* Hero */}
      <section
        style={{
          paddingTop: "clamp(80px, 22vh, 180px)",
          paddingBottom: "clamp(72px, 10vh, 104px)",
          paddingLeft: "24px",
          paddingRight: "24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "720px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "36px",
          }}
        >
          <Wordmark />

          <div
            className="animate-fade-up delay-1"
            style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}
          >
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: "clamp(2.25rem, 6vw, 3.75rem)",
                fontWeight: 400,
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
                color: "var(--color-text)",
                margin: 0,
                maxWidth: "600px",
              }}
            >
              Turn every podcast episode into a week of content.
            </h1>

            <p
              className="animate-fade-up delay-2"
              style={{
                fontSize: "1.0625rem",
                color: "var(--color-muted)",
                lineHeight: 1.6,
                margin: 0,
                maxWidth: "420px",
                fontWeight: 300,
              }}
            >
              Upload once. Timestamps, pull quotes, a LinkedIn post, YouTube
              chapters, three click-ready titles — in minutes.
            </p>
          </div>

          <Features />

          {formState === "success" ? (
            <p
              className="animate-fade-up"
              style={{ fontSize: "1rem", color: "var(--color-text)", fontWeight: 500, margin: 0 }}
            >
              You&apos;re on the list. We&apos;ll email you when PostPod opens up.
            </p>
          ) : (
            <div
              className="animate-fade-up delay-4"
              style={{
                width: "100%",
                maxWidth: "480px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <FormFields
                onSuccess={() => setFormState("success")}
                onDuplicate={() => setFormState("duplicate")}
              />

              {formState === "duplicate" && (
                <p style={{ fontSize: "0.875rem", color: "var(--color-muted)", margin: 0 }}>
                  You&apos;re already on the list — we&apos;ll email you at launch.
                </p>
              )}

              <p
                className="animate-fade-up delay-5"
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--color-muted)",
                  margin: 0,
                  letterSpacing: "0.01em",
                }}
              >
                No spam. One email when we launch.
              </p>
            </div>
          )}
        </div>
      </section>

      <HowItWorks />
      <BuiltFor />
      <Footer />
    </>
  );
}
