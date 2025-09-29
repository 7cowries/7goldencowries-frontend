import { useEffect, useState } from "react";
import Toast from "./Toast";
import "./ConnectButtons.css";
import { useWallet } from "../hooks/useWallet";

/**
 * WalletConnect component - single connect/disconnect button.
 * NOTE: We intentionally DO NOT render <TonConnectButton /> here to avoid
 * duplicate UI and accidental double-open modals. Components that need the
 * TonConnectButton (e.g. Paywall) should render it themselves.
 */
export default function WalletConnect({ className = "" }) {
  const { wallet, connect, disconnect, connecting, error } = useWallet();
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!error) return undefined;
    setToast(error);
    const id = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(id);
  }, [error]);

  const showError = (msg) => {
    if (!msg) return;
    setToast(msg);
    window.setTimeout(() => setToast(""), 3200);
  };

  const handleConnect = async () => {
    try {
      if (connecting) return; // prevent re-entrancy
      await connect();
    } catch (e) {
      if (e?.message) showError(e.message);
    }
  };

  const handleDisconnect = async () => {
    try {
      if (connecting) return; // prevent re-entrancy
      await disconnect();
    } catch (e) {
      if (e?.message) showError(e.message);
    }
  };

  const short = wallet ? `${wallet.slice(0, 4)}…${wallet.slice(-4)}` : null;

  return (
    <div className={`connect-buttons ${className}`.trim()}>
      {wallet ? (
        <button
          type="button"
          className="connect-btn"
          onClick={handleDisconnect}
          disabled={connecting}
        >
          Disconnect {short}
        </button>
      ) : (
        <button
          type="button"
          className="connect-btn"
          onClick={handleConnect}
          disabled={connecting}
        >
          {connecting ? "Opening…" : "Connect Wallet"}
        </button>
      )}
      <Toast message={toast} />
    </div>
  );
}
