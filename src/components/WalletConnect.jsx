// src/components/WalletConnect.jsx
import React, { useEffect, useState } from "react";
import {
  connectWallet,
  disconnectWallet,
  getWalletAccount,
} from "../hooks/useWallet";

const MANIFEST =
  process.env.REACT_APP_TONCONNECT_MANIFEST_URL ||
  "https://7goldencowries.com/tonconnect-manifest.json";

export default function WalletConnect({ className = "" }) {
  const [account, setAccount] = useState(null);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const acc = await getWalletAccount();
    setAccount(acc);
  };

  useEffect(() => {
    refresh();
  }, []);

  const onConnect = async () => {
    setBusy(true);
    try {
      await connectWallet(MANIFEST);
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const onDisconnect = async () => {
    setBusy(true);
    try {
      await disconnectWallet();
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  if (account) {
    const addr =
      account.account?.address ??
      account.account?.address?.toString?.() ??
      "connected";
    return (
      <button className={`wallet-button ${className}`} onClick={onDisconnect} disabled={busy}>
        Disconnect ({String(addr).slice(0, 6)}…{String(addr).slice(-4)})
      </button>
    );
  }

  return (
    <button className={`wallet-button ${className}`} onClick={onConnect} disabled={busy}>
      {busy ? "Connecting…" : "Connect Wallet"}
    </button>
  );
}
