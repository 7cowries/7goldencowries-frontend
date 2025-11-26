import React, { useMemo } from "react";
import { API_URLS } from "../utils/api";

function b64(s) {
  try { return btoa(s); } catch { return ""; }
}

export default function ConnectButtons({ address = "", className = "" }) {
  const hasWallet = !!address;
  const startUrls = useMemo(
    () => ({
      twitter: API_URLS.twitterStart || "/api/auth/twitter/start",
      telegram: API_URLS.telegramStart || "/api/auth/telegram/start",
      discord: API_URLS.discordStart || "/api/auth/discord/start",
    }),
    []
  );

  const go = (path) => {
    if (!hasWallet) return alert("Connect your wallet first");
    const state = b64(address);
    const sep = path.includes("?") ? "&" : "?";
    const targetPath = `${path}${sep}state=${encodeURIComponent(state)}`;
    window.location.href = targetPath;
  };

  const connectTwitter = () => go(startUrls.twitter);
  const connectTelegram = () => go(startUrls.telegram);
  const connectDiscord = () => go(startUrls.discord);

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
