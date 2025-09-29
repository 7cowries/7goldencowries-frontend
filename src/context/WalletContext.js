import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { ensureWalletBoundDebounced as ensureWalletBound } from "../utils/walletBindDebounced";
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
  const [wallet, setWallet] = useState(() => {
    try {
      return localStorage.getItem("walletAddress") || null;
    } catch (e) {
      return null;
    }
  });
  const tonWallet = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const [error, setError] = useState(null);

  // track last bind attempt to avoid client-side stampede
  const lastBindAtRef = useRef(0);
  const BIND_THROTTLE_MS = 2000; // 2s

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

  // update wallet when TonConnect provides one (safeguard rapid toggle)
  useEffect(() => {
    // tonWallet is the address provided by TonConnect
    if (tonWallet && tonWallet !== wallet) {
      setWallet(tonWallet);
      return;
    }
    if (!tonWallet && wallet) {
      // only clear wallet if ton wallet disappeared (e.g. disconnect)
      setWallet(null);
    }
  }, [tonWallet, wallet]);

  // bind wallet to backend session (debounced to prevent repeated calls)
  useEffect(() => {
    if (!wallet) return;

    const now = Date.now();
    if (now - (lastBindAtRef.current || 0) < BIND_THROTTLE_MS) {
      // too soon since last bind attempt — skip it
      return;
    }
    lastBindAtRef.current = now;

    // kick off binding, record errors but don't rethrow
    ensureWalletBound(wallet).catch((e) => {
      console.error("[WalletContext] bind error", e);
      setError(e?.message || "Failed to bind wallet");
    });
  }, [wallet]);

  const disconnect = useCallback(
    async ({ skipTonDisconnect = false } = {}) => {
      try {
        if (!skipTonDisconnect) {
          try {
            await tonConnectUI.disconnect();
          } catch (e) {
            // ignore tonConnectUI disconnect errors but log them
            console.warn("[WalletContext] tonConnectUI.disconnect failed", e);
          }
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
