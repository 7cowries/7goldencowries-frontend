import { ensureTonUI } from "../utils/ton";
import React, { useEffect, useState } from "react";

const MANIFEST_URL = "https://7goldencowries.com/tonconnect-manifest.json";

function findTonAddress() {
  try {
    const w = typeof window !== "undefined" ? window : {};
    const maybe =
      w?.ton?.account?.address ||
      w?.tonConnectUI?.account?.address ||
      w?.tonkeeper?.account?.address;
    if (maybe) return maybe;
  } catch (_) {}

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      const v = localStorage.getItem(k);
      if (!v) continue;
      if (/ton|wallet/i.test(k)) {
        try {
          const j = JSON.parse(v);
          const a =
            j?.account?.address ||
            j?.address ||
            j?.wallet?.account?.address ||
            j?.state?.account?.address;
          if (a) return a;
        } catch (_) {}
      }
    }
  } catch (_) {}
  return null;
}

export default function WalletConnect({ compact = false }) {
// TON UI boot
  useEffect(() => { try { ensureTonUI(); } catch(_) {} }, []);

  const [addr, setAddr] = useState(null);

  useEffect(() => {
    const update = () => setAddr(findTonAddress());
    update();
    window.addEventListener("storage", update);
    const t = setInterval(update, 2000); // light poll as a fallback
    return () => {
      window.removeEventListener("storage", update);
      clearInterval(t);
    };
  }, []);

  const connect = async () => {
    try {
      if (window.tonConnectUI?.openModal) {
        await window.tonConnectUI.openModal();
        return;
      }
    } catch (_) {}
    // Fallback: open manifest (wallets that support TonConnect can pick this up)
    window.open(MANIFEST_URL, "_blank");
  };

  const disconnect = async () => {
    try { if (window.tonConnectUI?.disconnect) await window.tonConnectUI.disconnect(); } catch(_) {}
    try { if (window.ton?.disconnect) await window.ton.disconnect(); } catch(_) {}

    try {
      const toRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && /ton|wallet/i.test(k)) toRemove.push(k);
      }
      toRemove.forEach(k => localStorage.removeItem(k));
    } catch (_) {}

    setAddr(null);
    setTimeout(() => window.location.reload(), 150);
  };

  const short = addr ? addr.slice(0, 4) + "…" + addr.slice(-4) : "";
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: compact ? "6px 10px" : "10px 14px",
    borderRadius: 12,
    border: "1px solid #94A3B8",
    color: "#e7e7ff",
    fontWeight: 600,
    background: "rgba(255,255,255,0.08)",
    textDecoration: "none",
    cursor: "pointer"
  };

  if (!addr) {
    return (
      <button onClick={connect} style={{ ...base, background: "#0b2240" }}>
        Connect Wallet
      </button>
    );
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <div style={{ ...base, cursor: "default" }}>Connected {short}</div>
      <button onClick={disconnect} style={{ ...base, background: "transparent" }}>
        Disconnect
      </button>
    </div>
  );
}
