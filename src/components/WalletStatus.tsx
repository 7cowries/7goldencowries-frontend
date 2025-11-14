import React, { useMemo } from "react";
import useWallet from "@/hooks/useWallet";

/**
 * Simple wallet status pill for the sidebar.
 * Uses TonConnect via useWallet as the single source of truth.
 */

function shortAddress(addr: string | null): string {
  if (!addr) return "";
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const WalletStatus: React.FC = () => {
  const { wallet, isConnected, isConnecting, connect, disconnect } = useWallet();

  const label = useMemo(() => {
    if (isConnecting) return "Connecting…";
    if (isConnected && wallet) return shortAddress(wallet);
    return "Not connected";
  }, [isConnecting, isConnected, wallet]);

  const buttonLabel = useMemo(() => {
    if (isConnecting) return "Connecting…";
    if (isConnected) return "Disconnect";
    return "Connect";
  }, [isConnecting, isConnected]);

  const handleClick = async () => {
    if (isConnecting) return;
    try {
      if (isConnected) {
        await disconnect();
      } else {
        await connect();
      }
    } catch (e) {
      // swallow – TonConnect UI will surface any errors
      console.warn("[WalletStatus] wallet action failed:", e);
    }
  };

  return (
    <div className="wallet-status">
      <span className="wallet-status-label">
        {isConnected && wallet ? "Connected" : "Wallet"}
      </span>
      <button
        type="button"
        className={`wallet-status-button ${
          isConnected ? "wallet-status-connected" : "wallet-status-disconnected"
        }`}
        onClick={handleClick}
        disabled={isConnecting}
      >
        {label || buttonLabel}
      </button>
    </div>
  );
};

export default WalletStatus;
