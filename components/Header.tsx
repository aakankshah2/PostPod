"use client";

import Link from "next/link";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";

type Props = {
  onHome?: () => void;
  creditsLabel?: string;
};

export function Header({ onHome, creditsLabel = "1 free episode left" }: Props) {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();

  return (
    <header className="header">
      <button className="logo" onClick={onHome} style={{ background: "none", border: "none" }}>
        <div className="logo-mark">P</div>
        <span>
          Post<em>Pod</em>
        </span>
      </button>

      <div className="header-right">
        {isAuthenticated ? (
          <>
            <span className="pill">{creditsLabel}</span>
            <button
              className="pill-link"
              onClick={async () => {
                await signOut();
                router.push("/");
              }}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              Sign out
            </button>
          </>
        ) : (
          <Link href="/sign-in" className="pill-link">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
