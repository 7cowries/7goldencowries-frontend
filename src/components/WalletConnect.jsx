import React, { useState } from "react";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import Toast from "./Toast";
import "./ConnectButtons.css";
import { useWallet } from "../context/WalletContext";

/**
 * WalletConnect component: shows a connect or disconnect button using
 * TonConnect v2. Basic error handling is provided via a temporary toast.
 */
export default function WalletConnect({ className = "" }) {
  const [tonConnectUI] = useTonConnectUI();
  const address = useTonAddress();
  const { disconnect: ctxDisconnect } = useWallet();
  const [toast, setToast] = useState("");

  const showError = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const connect = async () => {
    try {
      await tonConnectUI.openModal();
    } catch (e) {
      console.error("[WalletConnect] connect error", e);
      showError(e?.message || "Wallet connection failed");
    }
  };

  const disconnect = async () => {
    try {
      await ctxDisconnect();
    } catch (e) {
      console.error("[WalletConnect] disconnect error", e);
      showError(e?.message || "Failed to disconnect");
    }
  };

  return (
    <div className={`connect-buttons ${className}`.trim()}>
      {address ? (
        <button type="button" className="connect-btn" onClick={disconnect}>
          Disconnect {address.slice(0, 4)}…{address.slice(-4)}
        </button>
      ) : (
        <button type="button" className="connect-btn" onClick={connect}>
          Connect Wallet
        </button>
      )}
      <Toast message={toast} />
    </div>
  );
}
