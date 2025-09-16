import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { ensureWalletBound } from "../utils/walletBind";
import { emitWalletChanged } from "../utils/events";

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
    if (!wallet) {
      try {
        localStorage.removeItem("walletAddress");
        localStorage.removeItem("wallet");
        localStorage.removeItem("ton_wallet");
      } catch (err) {
        console.warn("[WalletContext] failed clearing wallet", err);
      }
      emitWalletChanged("");
      return;
    }
    try {
      localStorage.setItem("walletAddress", wallet);
      localStorage.setItem("wallet", wallet);
      localStorage.setItem("ton_wallet", wallet);
    } catch (err) {
      console.warn("[WalletContext] failed saving wallet", err);
    }
    emitWalletChanged(wallet);
  }, [wallet]);

  // update wallet when TonConnect provides one
  useEffect(() => {
    if (tonWallet && tonWallet !== wallet) {
      setWallet(tonWallet);
      return;
    }
    if (!tonWallet && wallet) {
      setWallet(null);
    }
  }, [tonWallet, wallet]);

  // bind wallet to backend session
  useEffect(() => {
    if (!wallet) return;
    ensureWalletBound(wallet).catch((e) => {
      console.error("[WalletContext] bind error", e);
      setError(e?.message || "Failed to bind wallet");
    });
  }, [wallet]);

  const disconnect = useCallback(
    async ({ skipTonDisconnect = false } = {}) => {
      try {
        if (!skipTonDisconnect) {
          await tonConnectUI.disconnect();
        }
        setError(null);
      } catch (e) {
        console.error("[WalletContext] disconnect error", e);
        setError(e?.message || "Failed to disconnect");
        throw e;
      } finally {
        setWallet(null);
      }
    },
    [setError, tonConnectUI]
  );

  // also read any TON address that other code may have saved
  const value = useMemo(
    () => ({ wallet, setWallet, disconnect, error, setError }),
    [wallet, error, disconnect]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
