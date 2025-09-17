
import { useEffect, useState } from "react";
import Toast from "./Toast";
import "./ConnectButtons.css";
import { useWallet } from "../hooks/useWallet";

/**
 * WalletConnect component: shows a connect or disconnect button backed by the
 * shared `useWallet` hook. Errors surface as a temporary toast.
 */
export default function WalletConnect({ className = "" }) {
  const { wallet, connect, disconnect, connecting, error } = useWallet();
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!error) return;
    setToast(error);
    const id = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(id);
  }, [error]);

  const showError = (msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 3200);
  };

  const handleConnect = async () => {
    try {
      await connect();
    } catch (e) {
      if (e?.message) showError(e.message);

import { useEffect, useRef } from "react";
import {
  TonConnectButton,
  useTonAddress,
  useTonWallet,
  useTonConnectUI,
} from "@tonconnect/ui-react";
import "./ConnectButtons.css";
import { bindWallet } from "../utils/api";

export default function WalletConnect({ className = "" }) {
  const [tonConnectUI] = useTonConnectUI();
  const userFriendlyAddress = useTonAddress();
  const wallet = useTonWallet();
  const lastAddressRef = useRef("");

  useEffect(() => {
    if (!tonConnectUI) return;
    const address = wallet?.account?.address || userFriendlyAddress || "";
    if (!address || lastAddressRef.current === address) return;
    lastAddressRef.current = address;

    bindWallet(address).catch(() => {});
    try {
      localStorage.setItem("wallet", address);
      localStorage.setItem("walletAddress", address);
      localStorage.setItem("ton_wallet", address);
    } catch (err) {
      console.warn("[WalletConnect] failed to persist wallet", err);

    }
    window.dispatchEvent(new CustomEvent("wallet:changed", { detail: { wallet: address } }));
  }, [tonConnectUI, wallet, userFriendlyAddress]);


  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (e) {
      if (e?.message) showError(e.message);

  useEffect(() => {
    if (!tonConnectUI) return;
    const address = wallet?.account?.address || userFriendlyAddress || "";
    if (address || !lastAddressRef.current) return;
    lastAddressRef.current = "";
    try {
      localStorage.removeItem("wallet");
      localStorage.removeItem("walletAddress");
      localStorage.removeItem("ton_wallet");
    } catch (err) {
      console.warn("[WalletConnect] failed to clear wallet", err);

    }
    window.dispatchEvent(new CustomEvent("wallet:changed", { detail: { wallet: "" } }));
  }, [tonConnectUI, wallet, userFriendlyAddress]);

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

      <TonConnectButton />

    </div>
  );
}
