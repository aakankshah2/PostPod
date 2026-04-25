"use client";

import { useState, useCallback, useEffect } from "react";
import { useAction } from "convex/react";
import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

import { Header } from "@/components/Header";
import { UploadScreen, type EpisodeSubmitData } from "@/components/UploadScreen";
import { ProcessingScreen } from "@/components/ProcessingScreen";
import { OutputsScreen } from "@/components/OutputsScreen";
import { PaymentModal } from "@/components/PaymentModal";
import { IconCheck } from "@/components/icons";

type Screen = "upload" | "processing" | "outputs";

export function PostPodApp() {
  const startTranscription = useAction(api.transcription.startTranscription);
  const generateAssets = useAction(api.assetGeneration.generateAssets);
  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();

  const [screen, setScreen] = useState<Screen>("upload");
  const [episode, setEpisode] = useState<EpisodeSubmitData | null>(null);
  const [payOpen, setPayOpen] = useState<{ open: boolean; defaultPack?: "single" | "pack" }>({ open: false });
  const [toast, setToast] = useState<string | null>(null);

  // Restore episode from localStorage on mount (handles post-sign-in redirect)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("postpod_episode");
      if (saved) {
        const parsed = JSON.parse(saved) as EpisodeSubmitData;
        if (parsed.episodeId && !parsed.isDemo) {
          setEpisode(parsed);
          setScreen("outputs");
        }
      }
    } catch {
      localStorage.removeItem("postpod_episode");
    }
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const handleSubmit = (data: EpisodeSubmitData) => {
    setEpisode(data);
    setScreen("processing");

    if (!data.isDemo && data.episodeId) {
      const id = data.episodeId as Id<"episodes">;
      if (data.hasAudio) {
        // Audio: transcribe first; transcription chains into generateAssets on completion
        void startTranscription({ episodeId: id });
      } else {
        // Transcript-only: skip transcription, go straight to asset generation
        void generateAssets({ episodeId: id });
      }
    }
  };

  const handleComplete = () => {
    setScreen("outputs");
  };

  // Persist real episode to localStorage so sign-in redirect doesn't lose state
  useEffect(() => {
    if (screen === "outputs" && episode?.episodeId && !episode.isDemo) {
      localStorage.setItem("postpod_episode", JSON.stringify(episode));
    }
  }, [screen, episode]);

  const handleError = useCallback(
    (msg: string) => {
      setScreen("upload");
      setEpisode(null);
      showToast(`Error: ${msg}`);
    },
    [showToast],
  );

  const handleHome = () => {
    localStorage.removeItem("postpod_episode");
    setScreen("upload");
    setEpisode(null);
  };

  return (
    <div className="app">
      <div className="ambient" />

      <Header onHome={handleHome} />

      {screen === "upload" && <UploadScreen onSubmit={handleSubmit} />}

      {screen === "processing" && (
        <ProcessingScreen
          episodeName={episode?.title ?? ""}
          episodeId={episode?.episodeId}
          onComplete={handleComplete}
          onError={handleError}
        />
      )}

      {screen === "outputs" && (
        <OutputsScreen
          episodeId={episode?.episodeId}
          isDemo={episode?.isDemo ?? true}
          episodeName={episode?.title ?? ""}
          onUnlock={(packId) => {
            if (!isAuthenticated) {
              router.push("/sign-in");
              return;
            }
            setPayOpen({ open: true, defaultPack: packId });
          }}
          onHome={handleHome}
          showToast={showToast}
        />
      )}

      {payOpen.open && (
        <PaymentModal
          episodeName={episode?.title ?? ""}
          defaultPack={payOpen.defaultPack}
          onClose={() => setPayOpen({ open: false })}
          onSuccess={() => {
            setPayOpen({ open: false });
            showToast("Credits added — use a credit to unlock your outputs.");
          }}
        />
      )}

      {toast && (
        <div className="toast">
          <IconCheck size={14} stroke={2.5} /> {toast}
        </div>
      )}
    </div>
  );
}
