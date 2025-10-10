// src/components/PaywallButton.jsx
import React, { useCallback, useState } from "react";
import useWallet, { connect as connectWallet, disconnect as disconnectWallet } from "../hooks/useWallet";

/**
 * A generic paywall/subscription button that ensures the user is connected,
 * then calls an optional onPay/onSubscribe callback supplied by the parent.
 *
 * Props:
 * - label?: string
 * - className?: string
 * - onPay?: (address: string|null) => Promise<void> | void   // optional
 */
export default function PaywallButton({
  label = "Subscribe",
  className = "",
  onPay,
}) {
  // Our hook returns { connected, address, ui }
  const { connected, address } = useWallet();
  const [busy, setBusy] = useState(false);
  const short = (addr) =>
    String(addr ?? "").slice(0, 6) + "…" + String(addr ?? "").slice(-4);

  const handleClick = useCallback(async () => {
    setBusy(true);
    try {
      if (!connected) {
        // use named helper from the hook module
        await connectWallet();
      }
      if (typeof onPay === "function") {
        await onPay(address);
      }
    } finally {
      setBusy(false);
    }
  }, [connected, address, onPay]);

  const handleDisconnect = useCallback(async () => {
    setBusy(true);
    try {
      await disconnectWallet();
    } finally {
      setBusy(false);
    }
  }, []);

  return (
    <button
      type="button"
      className={className}
      disabled={busy}
      onClick={handleClick}
      title={connected && address ? `Connected: ${short(address)}` : "Connect wallet"}
    >
      {busy ? "Please wait…" : label}
    </button>
  );
}
