"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { IconShield, IconClock } from "@/components/icons";

export function SignInGate() {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "sent">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email || loading) return;
    setLoading(true);
    setError(null);
    try {
      await signIn("resend", { email, redirectTo: "/" });
      setStep("sent");
    } catch {
      setError("Couldn't send the link — check your email and try again.");
    } finally {
      setLoading(false);
    }
  };

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
          {step === "email" ? (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0, lineHeight: 1.55 }}>
                Enter your email to get started — no password needed.
              </p>

              <input
                type="email"
                className="episode-input"
                placeholder="host@yourpodcast.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoFocus
                required
              />

              {error && (
                <p style={{ fontSize: 13, color: "var(--danger)", margin: 0 }}>{error}</p>
              )}

              <button
                type="submit"
                className="submit-btn"
                disabled={loading || !email}
              >
                {loading ? "Sending…" : "Send magic link →"}
              </button>
            </form>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "8px 0", textAlign: "center" }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "var(--accent-dim)", border: "1px solid var(--accent)",
                display: "grid", placeItems: "center", fontSize: 22,
              }}>
                ✉
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 600, margin: "0 0 6px" }}>Check your inbox</p>
                <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0, lineHeight: 1.55 }}>
                  We sent a magic link to <strong style={{ color: "var(--text)" }}>{email}</strong>.
                  Click it to continue — expires in 10 minutes.
                </p>
                <p style={{ fontSize: 12, color: "var(--text-dim)", margin: "8px 0 0", lineHeight: 1.55 }}>
                  Can&apos;t find it? Check your <strong style={{ color: "var(--text-muted)" }}>spam or junk folder</strong> — it sometimes lands there.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setStep("email"); setError(null); }}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--accent)", padding: 0 }}
              >
                Wrong email? Try again
              </button>
            </div>
          )}
        </div>

        <div className="upload-foot">
          <span><IconShield size={14} /> Files never leave your workspace</span>
          <span><IconClock size={14} /> ~45 sec for a 45-min episode</span>
        </div>

        <p className="hero-disclaimer">
          <span className="asterisk">*</span> Processing time varies with file size and length.
        </p>
      </div>
    </div>
  );
}
