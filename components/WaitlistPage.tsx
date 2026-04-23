"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, FormEvent } from "react";

type FormState = "idle" | "loading" | "success" | "duplicate" | "error";

function Wordmark() {
  return (
    <div
      className="animate-fade-up"
      style={{
        fontFamily: "var(--font-body)",
        fontWeight: 600,
        fontSize: "0.875rem",
        letterSpacing: "0.08em",
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

function Bullets() {
  const items = [
    { icon: "⏱", text: "Timestamps + YouTube chapters, auto-generated" },
    { icon: "💬", text: "8 pull quotes + a ready-to-post LinkedIn write-up" },
    { icon: "🎯", text: "3 hook-tested titles built for click-through" },
  ];

  return (
    <ul
      className="animate-fade-up delay-3"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        width: "100%",
        maxWidth: "400px",
        textAlign: "left",
        listStyle: "none",
        padding: 0,
        margin: 0,
      }}
    >
      {items.map(({ icon, text }) => (
        <li
          key={text}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            fontSize: "0.9375rem",
            color: "var(--color-text)",
            lineHeight: 1.5,
          }}
        >
          <span style={{ flexShrink: 0, marginTop: "1px" }}>{icon}</span>
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}

function WaitlistForm({
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
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          width: "100%",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          disabled={state === "loading"}
          style={{
            flex: "1 1 220px",
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
            backgroundColor: state === "loading" ? "var(--color-accent-hover)" : "var(--color-accent)",
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
            if (state !== "loading") {
              (e.target as HTMLButtonElement).style.backgroundColor = "var(--color-accent-hover)";
            }
          }}
          onMouseLeave={(e) => {
            if (state !== "loading") {
              (e.target as HTMLButtonElement).style.backgroundColor = "var(--color-accent)";
            }
          }}
          onMouseDown={(e) => {
            (e.target as HTMLButtonElement).style.transform = "scale(0.98)";
          }}
          onMouseUp={(e) => {
            (e.target as HTMLButtonElement).style.transform = "scale(1)";
          }}
        >
          {state === "loading" ? "Joining…" : "Get Early Access"}
        </button>
      </form>

      {state === "error" && (
        <p style={{ fontSize: "0.875rem", color: "#dc2626", margin: 0 }}>
          Something went wrong. Try again in a moment.
        </p>
      )}
    </div>
  );
}

export function WaitlistPage() {
  const [formState, setFormState] = useState<"idle" | "success" | "duplicate">("idle");

  return (
    <main
      style={{
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "640px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "32px",
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
              fontSize: "clamp(2.25rem, 6vw, 3.5rem)",
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
              color: "var(--color-text)",
              margin: 0,
              maxWidth: "560px",
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
              maxWidth: "500px",
              fontWeight: 300,
            }}
          >
            Upload once. Get timestamps, pull quotes, a LinkedIn post, YouTube
            chapters, and three click-worthy titles — in minutes.
          </p>
        </div>

        <Bullets />

        {formState === "success" ? (
          <p
            className="animate-fade-up"
            style={{
              fontSize: "1rem",
              color: "var(--color-text)",
              fontWeight: 500,
              margin: 0,
            }}
          >
            You&apos;re on the list. We&apos;ll email you when PostPod opens up.
          </p>
        ) : (
          <>
            <WaitlistForm
              onSuccess={() => setFormState("success")}
              onDuplicate={() => setFormState("duplicate")}
            />

            {formState === "duplicate" && (
              <p style={{ fontSize: "0.875rem", color: "var(--color-muted)", margin: "-20px 0 0" }}>
                You&apos;re already on the list — we&apos;ll email you at launch.
              </p>
            )}

            <p
              className="animate-fade-up delay-5"
              style={{
                fontSize: "0.8125rem",
                color: "var(--color-muted)",
                margin: "-16px 0 0",
                letterSpacing: "0.01em",
              }}
            >
              No spam. One email when we launch.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
