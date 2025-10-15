import React, { useMemo } from "react";
import { API_BASE as RAW_API_BASE } from "../utils/api";

function join(base, path) {
  if (!base) return path;
  if (/^https?:\/\//i.test(base)) {
    return `${base}${path}`;
  }
  if (base.endsWith("/")) {
    return `${base.replace(/\/+$/, "")}${path}`;
  }
  return `${base}${path}`;
}

function b64(s) {
  try { return btoa(s); } catch { return ""; }
}

export default function ConnectButtons({ address = "", className = "" }) {
  const hasWallet = !!address;
  const apiBase = useMemo(() => RAW_API_BASE || "", []);

  const go = (path) => {
    if (!hasWallet) return alert("Connect your wallet first");
    const state = b64(address);
    const sep = path.includes("?") ? "&" : "?";
    const targetPath = `${path}${sep}state=${state}`;
    window.location.href = join(apiBase, targetPath);
  };

  const connectTwitter = () => go("/api/auth/twitter/start");
  const connectTelegram = () => go("/api/auth/telegram/start");
  const connectDiscord = () => go("/api/auth/discord/start");

  const disabled = !hasWallet;

  const Btn = ({ onClick, children, title }) => (
    <button
      type="button"
      className="connect-btn"
      title={title || ""}
      onClick={onClick}
      disabled={disabled}
      style={{
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );

  return (
    <div className={`connect-buttons ${className}`}>
      <Btn onClick={connectTwitter} title="Link your X (Twitter) account">🐦 Connect X (Twitter)</Btn>
      <Btn onClick={connectTelegram} title="Start the Telegram bot and link">📣 Connect Telegram</Btn>
      <Btn onClick={connectDiscord} title="Authorize via Discord OAuth">🎮 Connect Discord</Btn>
    </div>
  );
}
