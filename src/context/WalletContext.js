import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { ensureWalletBound } from "../utils/walletBind";

// Context now also exposes a `disconnect` helper and potential error state.
const WalletContext = createContext({
  wallet: null,
  setWallet: () => {},
  disconnect: () => {},
  error: null,
});
export const useWallet = () => useContext(WalletContext);

export default function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(() => localStorage.getItem("walletAddress") || null);
  const tonWallet = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const [error, setError] = useState(null);

  // keep localStorage in sync
  useEffect(() => {
    if (wallet) {
      localStorage.setItem("walletAddress", wallet);
      localStorage.setItem("wallet", wallet);
      window.dispatchEvent(new CustomEvent('wallet:changed', { detail: { wallet } }));
    }
  }, [wallet]);

  // update wallet when TonConnect provides one
  useEffect(() => {
    if (tonWallet) setWallet(tonWallet);
  }, [tonWallet]);

  // bind wallet to backend session
  useEffect(() => {
    if (!wallet) return;
    ensureWalletBound(wallet).catch((e) => {
      console.error("[WalletContext] bind error", e);
      setError(e?.message || "Failed to bind wallet");
    });
  }, [wallet]);

  const disconnect = async () => {
    try {
      await tonConnectUI.disconnect();
    } catch (e) {
      console.error("[WalletContext] disconnect error", e);
      setError(e?.message || "Failed to disconnect");
    }
    setWallet(null);
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("wallet");
    window.dispatchEvent(new CustomEvent("wallet:changed", { detail: { wallet: "" } }));
  };

  // also read any TON address that other code may have saved
  const value = useMemo(
    () => ({ wallet, setWallet, disconnect, error, setError }),
    [wallet, error]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
