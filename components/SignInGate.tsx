"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

type Props = {
  episodeName: string;
};

export function SignInGate({ episodeName }: Props) {
  const { signIn } = useAuthActions();
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signIn("google", { redirectTo: "/" });
    } catch {
      setLoading(false);
    }
  };

  const displayName =
    episodeName.length > 42 ? `${episodeName.slice(0, 42)}…` : episodeName;

  return (
    <div className="screen">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100%",
          padding: "40px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "var(--accent-dim)",
            border: "1px solid var(--accent)",
            display: "grid",
            placeItems: "center",
            marginBottom: 24,
            fontSize: 26,
          }}
        >
          ✓
        </div>

        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "-0.025em",
            marginBottom: 8,
            maxWidth: 440,
          }}
        >
          Your outputs are ready
        </h1>

        <p
          style={{
            fontSize: 14,
            color: "var(--text-muted)",
            marginBottom: 6,
            maxWidth: 380,
            lineHeight: 1.55,
          }}
        >
          PostPod just generated titles, chapters, pull quotes, a LinkedIn post,
          and show notes for
        </p>
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--text)",
            marginBottom: 32,
            maxWidth: 380,
          }}
        >
          &ldquo;{displayName}&rdquo;
        </p>

        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 24px",
            background: "#fff",
            color: "#1f1f1f",
            border: "none",
            borderRadius: "var(--radius)",
            fontSize: 15,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
            transition: "opacity 0.15s, transform 0.1s",
            minWidth: 240,
            justifyContent: "center",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.transform =
              "translateY(-1px)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.transform = "none")
          }
        >
          <GoogleIcon />
          {loading ? "Redirecting…" : "Continue with Google"}
        </button>

        <p
          style={{
            fontSize: 12,
            color: "var(--text-dim)",
            marginTop: 20,
            maxWidth: 320,
            lineHeight: 1.5,
          }}
        >
          Free account. Your outputs are saved and waiting — no re-processing needed.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
