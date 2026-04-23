"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState, type FormEvent } from "react";
import Link from "next/link";

type Step = "email" | "sent";

export default function SignIn() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn("resend", { email, redirectTo: "/" });
      setStep("sent");
    } catch {
      setError("Couldn't send the link. Check your email and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 50% 35% at 50% 0%, rgba(255, 214, 10, 0.05), transparent 70%)",
        }}
      />

      {/* Logo */}
      <Link
        href="/"
        style={{
          position: "absolute",
          top: 22,
          left: 32,
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontWeight: 700,
          fontSize: 16,
          letterSpacing: "-0.01em",
          color: "var(--text)",
          textDecoration: "none",
        }}
      >
        <div className="logo-mark">P</div>
        <span>
          Post
          <em
            style={{
              color: "var(--accent)",
              fontStyle: "normal",
              textDecoration: "underline",
              textDecorationColor: "var(--accent)",
              textUnderlineOffset: "3px",
            }}
          >
            Pod
          </em>
        </span>
      </Link>

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-soft)",
          borderRadius: "var(--radius-lg)",
          padding: "36px 32px",
          boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {step === "email" ? (
          <>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: "-0.025em",
                marginBottom: 6,
              }}
            >
              Sign in to PostPod
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "var(--text-muted)",
                marginBottom: 28,
                lineHeight: 1.5,
              }}
            >
              Enter your email and we&apos;ll send you a magic link — no password needed.
            </p>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              <div>
                <label
                  htmlFor="email"
                  style={{
                    display: "block",
                    fontSize: 11,
                    color: "var(--text-dim)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 6,
                  }}
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="host@yourpodcast.com"
                  disabled={loading}
                  style={{
                    width: "100%",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-soft)",
                    borderRadius: "var(--radius)",
                    padding: "14px 16px",
                    fontSize: 15,
                    color: "var(--text)",
                    transition: "border-color 0.15s",
                    opacity: loading ? 0.6 : 1,
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--text-muted)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "var(--border-soft)")
                  }
                />
              </div>

              {error && (
                <p style={{ fontSize: 13, color: "var(--danger)", margin: 0 }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="submit-btn"
                style={{ marginTop: 4 }}
              >
                {loading ? "Sending…" : "Send magic link"}
              </button>
            </form>
          </>
        ) : (
          <>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "var(--accent-dim)",
                border: "1px solid var(--accent)",
                display: "grid",
                placeItems: "center",
                marginBottom: 20,
                fontSize: 24,
              }}
            >
              ✉
            </div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: "-0.025em",
                marginBottom: 8,
              }}
            >
              Check your inbox
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "var(--text-muted)",
                lineHeight: 1.55,
                marginBottom: 28,
              }}
            >
              We sent a magic link to{" "}
              <strong style={{ color: "var(--text)" }}>{email}</strong>. Click it
              to sign in — the link expires in 10 minutes.
            </p>
            <p style={{ fontSize: 13, color: "var(--text-dim)" }}>
              Didn&apos;t get it?{" "}
              <button
                onClick={() => {
                  setStep("email");
                  setError(null);
                }}
                style={{
                  color: "var(--accent)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  padding: 0,
                  textDecoration: "underline",
                  textDecorationColor: "transparent",
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.textDecorationColor =
                    "currentColor")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.textDecorationColor =
                    "transparent")
                }
              >
                Try again
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
