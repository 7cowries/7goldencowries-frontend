// src/components/WalletConnect.jsx
import React from "react";
import { useWallet } from "../hooks/useWallet";
import "./GlobalWalletButton.css";

export default function WalletConnect({ className = "" }) {
  // get everything — hook returns both shapes (legacy + new)
  const { wallet, isConnected, connected, account, connect, disconnect, _rawProvider } = useWallet();

  // prefer the canonical shape used in pages
  const active = typeof isConnected === "boolean" ? isConnected : !!connected;
  const address = wallet || (account && (account.address || account));

  const shortAddr = (addr = "") =>
    addr && addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;

  const handleConnect = () => {
    // eslint-disable-next-line no-console
    console.info("[WalletConnect] connect clicked - provider keys:", _rawProvider ? Object.keys(_rawProvider) : _rawProvider);
    try {
      connect && connect();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[WalletConnect] connect() threw:", err);
    }
  };

  const handleDisconnect = () => {
    // eslint-disable-next-line no-console
    console.info("[WalletConnect] disconnect clicked");
    try {
      disconnect && disconnect();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[WalletConnect] disconnect() threw:", err);
    }
  };

  return (
    <div className={`wallet-connect-wrapper ${className}`} style={{ zIndex: 99999 }}>
      {active ? (
        <div className="wallet-connected">
          <button className="wallet-btn wallet-disconnect" onClick={handleDisconnect} aria-label="Disconnect wallet" title="Disconnect">
            {shortAddr(address) || "Connected"} · Disconnect
          </button>
        </div>
      ) : (
        <button onClick={handleConnect} className="wallet-btn wallet-connect" aria-label="Connect wallet" title="Connect wallet">
          Connect Wallet
        </button>
      )}
    </div>
  );
}
