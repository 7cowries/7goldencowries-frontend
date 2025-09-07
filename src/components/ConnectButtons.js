// src/components/ConnectButtons.js
import React from "react";
import { api, API_BASE } from "../utils/api";
import { getSavedWallet } from "../utils/wallet";

export default function ConnectButtons({ onLinked }) {
  const go = (url) => (window.location.href = url);
  const b64 = (s) => {
    const bytes = new TextEncoder().encode(s || "");
    let binary = "";
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return window.btoa(binary);
  };

  async function connectTwitter() {
    const w = getSavedWallet();
    if (!w) return alert("Connect your wallet first.");
    go(`${API_BASE}/auth/twitter?state=${b64(w)}`);
  }

  async function connectTelegram() {
    const w = getSavedWallet();
    if (!w) return alert("Connect your wallet first.");
    go(`${API_BASE}/auth/telegram/start?state=${b64(w)}`);
  }

  async function connectDiscord() {
    const w = getSavedWallet();
    if (!w) return alert("Connect your wallet first.");
    try {
      const { url } = await api("/api/discord/login?state=" + encodeURIComponent(b64(w)));
      go(url);
    } catch {
      go(`${API_BASE}/auth/discord?state=${b64(w)}`);
    }
  }

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <button onClick={connectTwitter}>🐦 Connect X (Twitter)</button>
      <button onClick={connectTelegram}>📣 Connect Telegram</button>
      <button onClick={connectDiscord}>🎮 Connect Discord</button>
    </div>
  );
}
