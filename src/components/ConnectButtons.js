import React from "react";
import "./ConnectButtons.css";

// Backend base (Render). Set this in Vercel env: REACT_APP_API_URL=https://sevengoldencowries-backend.onrender.com
const API_BASE = process.env.REACT_APP_API_URL || "";

function b64(s) {
  try { return btoa(s); } catch { return ""; }
}

export default function ConnectButtons({ address = "", className = "" }) {
  const hasWallet = !!address;

  const go = (path) => {
    if (!hasWallet) return alert("Connect your wallet first");
    const state = b64(address);
    const sep = path.includes("?") ? "&" : "?";
    window.location.href = `${API_BASE}${path}${sep}state=${state}`;
  };

  const connectTwitter = () => go("/api/auth/twitter/start");
  const connectTelegram = () => go("/api/auth/telegram/start");
  const connectDiscord = () => go("/api/auth/discord/start");

  const disabled = !hasWallet || !API_BASE;

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
      {!API_BASE && (
        <p style={{marginTop:8,fontSize:12,opacity:.8}}>
          Set <code>REACT_APP_API_URL</code> in Vercel to enable these links.
        </p>
      )}
    </div>
  );
}
