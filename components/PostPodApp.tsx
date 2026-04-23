"use client";

import { useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { UploadScreen, type EpisodeSubmitData } from "@/components/UploadScreen";
import { ProcessingScreen } from "@/components/ProcessingScreen";
import { OutputsScreen } from "@/components/OutputsScreen";
import { PaymentModal } from "@/components/PaymentModal";
import { IconCheck } from "@/components/icons";
import { DEMO_OUTPUTS } from "@/lib/demoData";

type Screen = "upload" | "processing" | "outputs";

export function PostPodApp() {
  const [screen, setScreen] = useState<Screen>("upload");
  const [episode, setEpisode] = useState<EpisodeSubmitData | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const handleSubmit = (data: EpisodeSubmitData) => {
    setEpisode(data);
    setScreen("processing");
  };

  const handleComplete = () => {
    setScreen("outputs");
  };

  const handleHome = () => {
    setScreen("upload");
    setEpisode(null);
    setUnlocked(false);
  };

  const outputData = {
    ...DEMO_OUTPUTS,
    episodeName: episode?.title || DEMO_OUTPUTS.episodeName,
  };

  return (
    <div className="app">
      <div className="ambient" />

      <Header onHome={handleHome} />

      {screen === "upload" && <UploadScreen onSubmit={handleSubmit} />}

      {screen === "processing" && (
        <ProcessingScreen
          episodeName={episode?.title ?? ""}
          onComplete={handleComplete}
        />
      )}

      {screen === "outputs" && (
        <OutputsScreen
          data={outputData}
          unlocked={unlocked}
          onUnlock={() => setPayOpen(true)}
          onHome={handleHome}
          showToast={showToast}
        />
      )}

      {payOpen && (
        <PaymentModal
          episodeName={outputData.episodeName}
          onClose={() => setPayOpen(false)}
          onSuccess={() => {
            setUnlocked(true);
            setPayOpen(false);
            showToast("All outputs unlocked ✓");
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
