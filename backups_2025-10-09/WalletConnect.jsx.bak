// src/components/WalletConnect.jsx
import React, { useState, useEffect } from "react";
import { useWallet } from "../hooks/useWallet";
import "./GlobalWalletButton.css";

export default function WalletConnect({ className = "" }) {
  const { wallet, isConnected, connected, account, connect, disconnect, _rawProvider } = useWallet();
  const [connecting, setConnecting] = useState(false);

  // normalize active state
  const active = typeof isConnected === "boolean" ? isConnected : !!connected;
  const address = wallet || (account && (account.address || account));

  const shortAddr = (addr = "") =>
    addr && addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;

  // prevent double-click spam: don't call connect if already connected or currently connecting
  const handleConnect = async () => {
    if (active) {
      console.info("[WalletConnect] already connected, skipping open");
      return;
    }
    if (connecting) {
      console.info("[WalletConnect] connect already in progress, skipping");
      return;
    }
    setConnecting(true);
    try {
      await connect && connect();
    } catch (err) {
      console.error("[WalletConnect] connect() threw:", err);
    } finally {
      // safety short delay to prevent immediate re-clicks
      setTimeout(() => setConnecting(false), 600);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect && disconnect();
    } catch (err) {
      console.error("[WalletConnect] disconnect() threw:", err);
    }
  };

  useEffect(() => {
    if (active) setConnecting(false);
  }, [active]);

  return (
    <div className={`wallet-connect-wrapper ${className}`} style={{ zIndex: 99999 }}>
      {active ? (
        <div className="wallet-connected">
          <button
            className="wallet-btn wallet-disconnect"
            onClick={handleDisconnect}
            aria-label="Disconnect wallet"
            title="Disconnect"
          >
            {shortAddr(address) || "Connected"} · Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          className="wallet-btn wallet-connect"
          aria-label="Connect wallet"
          title="Connect wallet"
          disabled={connecting}
          style={{ opacity: connecting ? 0.7 : 1, pointerEvents: connecting ? "none" : "auto" }}
        >
          {connecting ? "Opening…" : "Connect Wallet"}
        </button>
      )}
    </div>
  );
}
