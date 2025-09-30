import React from "react";
import { useWallet } from "../hooks/useWallet";
import "./GlobalWalletButton.css";

export default function WalletConnect({ className = "" }) {
  const { connected, account, connect, disconnect } = useWallet();

  const shortAddr = (addr = "") =>
    addr && addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;

  return (
    <div className={`wallet-connect-wrapper ${className}`} style={{ zIndex: 99999 }}>
      {connected ? (
        <div className="wallet-connected">
          <button
            className="wallet-btn wallet-disconnect"
            onClick={() => disconnect()}
            aria-label="Disconnect wallet"
          >
            {shortAddr(account?.address) || "Connected"} · Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={() => connect()}
          className="wallet-btn wallet-connect"
          aria-label="Connect wallet"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
