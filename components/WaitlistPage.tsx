"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, FormEvent } from "react";

type FormState = "idle" | "loading" | "success" | "duplicate" | "error";

export function WaitlistPage() {
  const addToWaitlist = useMutation(api.waitlist.addToWaitlist);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      await addToWaitlist({ email });
      setState("success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("ALREADY_ON_LIST")) {
        setState("duplicate");
      } else {
        setState("error");
      }
    }
  }

  const showForm = state !== "success";

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[640px] flex flex-col items-center text-center gap-8">

        {/* Wordmark */}
        <div className="text-[1.1rem] font-bold tracking-tight text-[#0A0A0A]">
          Post
          <span className="relative inline-block">
            Pod
            <span
              className="absolute left-0 -bottom-[2px] w-full h-[2px]"
              style={{ backgroundColor: "#F5C518" }}
            />
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight text-[#0A0A0A]">
          Turn every podcast episode into a week of content.
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-lg text-[#6B6B6B] leading-relaxed max-w-[520px]">
          Upload once. Get timestamps, pull quotes, a LinkedIn post, YouTube
          chapters, and three click-worthy titles — in minutes.
        </p>

        {/* Bullets */}
        <ul className="flex flex-col gap-3 text-left w-full max-w-[420px]">
          <li className="flex items-start gap-3 text-[#0A0A0A] text-sm sm:text-base">
            <span className="mt-px">⏱</span>
            <span>Timestamps + YouTube chapters, auto-generated</span>
          </li>
          <li className="flex items-start gap-3 text-[#0A0A0A] text-sm sm:text-base">
            <span className="mt-px">💬</span>
            <span>8 pull quotes + a ready-to-post LinkedIn write-up</span>
          </li>
          <li className="flex items-start gap-3 text-[#0A0A0A] text-sm sm:text-base">
            <span className="mt-px">🎯</span>
            <span>3 hook-tested titles built for click-through</span>
          </li>
        </ul>

        {/* Form or Success */}
        <div className="w-full max-w-[480px] flex flex-col items-center gap-3">
          {showForm ? (
            <>
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 w-full"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={state === "loading"}
                  className="flex-1 px-4 py-3 border border-[#E5E5E5] rounded-lg text-[#0A0A0A] placeholder-[#6B6B6B] text-sm outline-none transition-colors focus:border-[#F5C518] focus:ring-2 focus:ring-[#F5C518]/20 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={state === "loading"}
                  className="px-6 py-3 rounded-lg text-sm font-semibold text-[#0A0A0A] transition-colors disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: "#F5C518" }}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLButtonElement).style.backgroundColor =
                      "#E3B316")
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLButtonElement).style.backgroundColor =
                      "#F5C518")
                  }
                >
                  {state === "loading" ? "Joining…" : "Join Waitlist"}
                </button>
              </form>

              {state === "duplicate" && (
                <p className="text-sm text-[#6B6B6B]">
                  You&apos;re already on the list — we&apos;ll email you when we launch.
                </p>
              )}

              {state === "error" && (
                <p className="text-sm text-red-500">
                  Something went wrong. Try again in a moment.
                </p>
              )}

              <p className="text-xs text-[#6B6B6B]">
                No spam. One email when we launch.
              </p>
            </>
          ) : (
            <p className="text-base text-[#0A0A0A] font-medium">
              You&apos;re on the list. We&apos;ll email you when PostPod opens up.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
