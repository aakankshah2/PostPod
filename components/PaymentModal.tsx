"use client";

import { useState } from "react";
import { IconClose, IconCheck, IconShield } from "@/components/icons";

type Props = {
  episodeName: string;
  onClose: () => void;
  onSuccess: () => void;
};

type Method = "upi" | "card" | "netbanking" | "wallet";
type Step = "form" | "processing" | "success";

const METHODS: { id: Method; label: string }[] = [
  { id: "upi",        label: "UPI" },
  { id: "card",       label: "Card" },
  { id: "netbanking", label: "NetBank" },
  { id: "wallet",     label: "Wallet" },
];

export function PaymentModal({ episodeName, onClose, onSuccess }: Props) {
  const [method, setMethod] = useState<Method>("upi");
  const [step, setStep] = useState<Step>("form");
  const [upi, setUpi] = useState("");
  const [email, setEmail] = useState("");

  const displayName =
    episodeName.length > 38 ? `${episodeName.slice(0, 38)}…` : episodeName;

  const pay = () => {
    setStep("processing");
    setTimeout(() => setStep("success"), 1600);
    setTimeout(() => onSuccess(), 2600);
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
            <div className="modal-amount">
              <span className="currency">₹</span>299
            </div>
            <div className="modal-for">Full unlock for &ldquo;{displayName}&rdquo;</div>

            <div className="modal-methods">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  className={`modal-method ${method === m.id ? "active" : ""}`}
                  onClick={() => setMethod(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {method === "upi" && (
              <div className="modal-row">
                <div className="modal-label">UPI ID</div>
                <input
                  className="modal-input"
                  placeholder="yourname@paytm"
                  value={upi}
                  onChange={(e) => setUpi(e.target.value)}
                />
              </div>
            )}

            {method === "card" && (
              <>
                <div className="modal-row">
                  <div className="modal-label">Card number</div>
                  <input className="modal-input" placeholder="4242 4242 4242 4242" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div className="modal-row">
                    <div className="modal-label">Expiry</div>
                    <input className="modal-input" placeholder="MM/YY" />
                  </div>
                  <div className="modal-row">
                    <div className="modal-label">CVV</div>
                    <input className="modal-input" placeholder="123" />
                  </div>
                </div>
              </>
            )}

            {method === "netbanking" && (
              <div className="modal-row">
                <div className="modal-label">Choose bank</div>
                <input className="modal-input" placeholder="HDFC, ICICI, Axis, SBI…" />
              </div>
            )}

            {method === "wallet" && (
              <div className="modal-row">
                <div className="modal-label">Wallet</div>
                <input className="modal-input" placeholder="Paytm, PhonePe, Amazon Pay…" />
              </div>
            )}

            <div className="modal-row">
              <div className="modal-label">Email for receipt</div>
              <input
                className="modal-input"
                placeholder="host@yourpodcast.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button className="modal-pay-btn" onClick={pay}>
              Pay ₹299 securely
            </button>

            <div className="modal-foot">
              <IconShield size={12} /> 256-bit encrypted · RBI-compliant
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="modal-body" style={{ textAlign: "center", padding: "40px 24px" }}>
            <div
              style={{
                margin: "0 auto 18px",
                width: 50,
                height: 50,
                border: "3px solid var(--border)",
                borderTopColor: "var(--accent)",
                borderRadius: "50%",
                animation: "spin 0.9s linear infinite",
              }}
            />
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
              Processing payment
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Contacting your bank securely…
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="modal-body" style={{ textAlign: "center", padding: "40px 24px" }}>
            <div
              style={{
                margin: "0 auto 18px",
                width: 54,
                height: 54,
                borderRadius: "50%",
                background: "var(--success)",
                color: "var(--bg)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <IconCheck size={28} stroke={3} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>
              Payment successful
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              All outputs unlocked. Redirecting…
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
