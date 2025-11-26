import React from "react";
import { API_URLS } from "../utils/api";

export default function ConnectButtons({ address = "", className = "" }) {
  const hasWallet = !!address;
  const connectTwitter = () => {
    if (!hasWallet) return alert("Connect your wallet first");
    window.location.href = API_URLS.twitterStart;
  };

  const connectTelegram = () => {
    if (!hasWallet) return alert("Connect your wallet first");
    window.location.href = API_URLS.telegramStart;
  };

  const connectDiscord = () => {
    if (!hasWallet) return alert("Connect your wallet first");
    window.location.href = API_URLS.discordStart;
  };

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
