"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { IconClose, IconCheck, IconShield } from "@/components/icons";

type PackId = "single" | "pack";

const PACKS: Record<PackId, { label: string; sub: string; credits: number; display: string }> = {
  single: { label: "Single episode",  sub: "1 credit",             credits: 1,  display: "₹299"  },
  pack:   { label: "10-credit pack",  sub: "10 credits · save ₹491", credits: 10, display: "₹2499" },
};

type Props = {
  episodeName: string;
  onClose: () => void;
  onSuccess: () => void;
  defaultPack?: "single" | "pack";  // NEW
};

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).Razorpay) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.head.appendChild(s);
  });
}

export function PaymentModal({ episodeName, onClose, onSuccess, defaultPack }: Props) {
  const createOrder = useAction(api.payments.createOrder);
  const verifyPayment = useAction(api.payments.verifyPayment);

  const [selectedPack, setSelectedPack] = useState<PackId>(defaultPack ?? "single");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "success">("form");
  const [error, setError] = useState<string | null>(null);
  const [unlockedCredits, setUnlockedCredits] = useState(0);

  const displayName = episodeName.length > 38 ? `${episodeName.slice(0, 38)}…` : episodeName;
  const pack = PACKS[selectedPack];

  const pay = async () => {
    setError(null);
    setLoading(true);
    try {
      const order = await createOrder({ packId: selectedPack });
      await loadRazorpayScript();

      await new Promise<void>((resolve, reject) => {
        const rzp = new (window as any).Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: "INR",
          name: "PostPod",
          description: pack.label,
          order_id: order.orderId,
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            try {
              const result = await verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              setUnlockedCredits(result.creditsPurchased);
              setStep("success");
              setTimeout(() => onSuccess(), 1800);
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: { ondismiss: () => reject(new Error("cancelled")) },
          theme: { color: "#ffffff" },
        });
        rzp.open();
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment failed";
      if (msg !== "cancelled") setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-brand">
            <div className="modal-brand-dot" />
            <span>Secure checkout · Razorpay</span>
          </div>
          <button className="modal-close" onClick={onClose}>
            <IconClose size={14} />
          </button>
        </div>

        {step === "form" && (
          <div className="modal-body">
            <div className="modal-for" style={{ marginBottom: 20 }}>
              Unlock outputs for &ldquo;{displayName}&rdquo;
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {(["single", "pack"] as PackId[]).map((id) => {
                const p = PACKS[id];
                const active = selectedPack === id;
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedPack(id)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "14px 16px",
                      border: `1.5px solid ${active ? "var(--text)" : "var(--border)"}`,
                      borderRadius: 8,
                      background: active ? "rgba(255,255,255,0.04)" : "transparent",
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "left",
                      transition: "border-color 0.15s",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>
                        {p.label}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 3 }}>
                        {p.sub}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: "var(--text)" }}>
                      {p.display}
                    </div>
                  </button>
                );
              })}
            </div>

            {error && (
              <div style={{ fontSize: 13, color: "#f87171", marginBottom: 14 }}>{error}</div>
            )}

            <button className="modal-pay-btn" onClick={pay} disabled={loading}>
              {loading ? "Opening checkout…" : `Pay ${pack.display} securely`}
            </button>

            <div className="modal-foot">
              <IconShield size={12} /> 256-bit encrypted · RBI-compliant
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="modal-body" style={{ textAlign: "center", padding: "40px 24px" }}>
            <div style={{
              margin: "0 auto 18px",
              width: 54,
              height: 54,
              borderRadius: "50%",
              background: "var(--success)",
              color: "var(--bg)",
              display: "grid",
              placeItems: "center",
            }}>
              <IconCheck size={28} stroke={3} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>
              Payment successful
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {unlockedCredits} credit{unlockedCredits !== 1 ? "s" : ""} added. Unlocking outputs…
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
