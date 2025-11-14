"use client";

import React, { useMemo } from "react";
import useWallet, { WalletState } from "@/hooks/useWallet";

function shortAddress(addr: string) {
  if (!addr) return "";
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

const WalletStatus: React.FC = () => {
  const hookState =
    typeof useWallet === "function"
      ? (useWallet() as WalletState)
      : {
          wallet: null,
          isConnected: false,
          connecting: false,
          connect: async () => {},
          disconnect: async () => {},
        };

  const { wallet, isConnected, connecting, connect, disconnect } = hookState;

  const label = useMemo(() => {
    if (connecting) return "Connecting…";
    if (isConnected && wallet) return `Connected ${shortAddress(wallet)}`;
    return "Connect Wallet";
  }, [wallet, isConnected, connecting]);

  return (
    <div className="sidebar-wallet">
      <button
        type="button"
        className="sidebar-wallet-main"
        onClick={isConnected ? undefined : connect}
        disabled={connecting}
      >
        {label}
      </button>
      {isConnected && (
        <button
          type="button"
          className="sidebar-wallet-disconnect"
          onClick={disconnect}
        >
          Disconnect
        </button>
      )}
    </div>
  );
};

export default WalletStatus;
