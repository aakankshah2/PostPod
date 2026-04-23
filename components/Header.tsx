"use client";

import Link from "next/link";
import { useConvexAuth } from "convex/react";

type Props = {
  onHome?: () => void;
  creditsLabel?: string;
};

export function Header({ onHome, creditsLabel = "1 free episode left" }: Props) {
  const { isAuthenticated } = useConvexAuth();

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
            <Link href="/sign-out" className="pill-link">
              Sign out
            </Link>
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
