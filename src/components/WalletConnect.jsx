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

  return (
    <div className={`connect-buttons ${className}`.trim()}>
      <TonConnectButton />
    </div>
  );
}
