import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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

/**
 * Safer WalletProvider:
 * - avoids treating `useTonAddress()`'s transient `undefined` as a disconnection
 * - throttles calls to ensureWalletBound to avoid hammering backend
 */
export default function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(() => {
    try {
      return localStorage.getItem("walletAddress") || null;
    } catch (e) {
      return null;
    }
  });

  const tonWallet = useTonAddress(); // from TonConnect provider (may be undefined temporarily)
  const [tonConnectUI] = useTonConnectUI();
  const [error, setError] = useState(null);

  // last time we attempted to bind wallet to backend (ms). Used to throttle binds.
  const lastBoundRef = useRef(0);
  // pending bind timer id (debounce)
  const bindTimerRef = useRef(null);

  // keep localStorage in sync
  useEffect(() => {
    try {
      if (!wallet) {
        localStorage.removeItem("walletAddress");
        localStorage.removeItem("wallet");
        localStorage.removeItem("ton_wallet");
        emitWalletChanged("");
        return;
      }
      localStorage.setItem("walletAddress", wallet);
      localStorage.setItem("wallet", wallet);
      localStorage.setItem("ton_wallet", wallet);
      emitWalletChanged(wallet);
    } catch (err) {
      console.warn("[WalletContext] storage sync failed", err);
    }
  }, [wallet]);

  // Sync tonWallet -> wallet but protect against the transient `undefined` state.
  // Rules:
  //  - if tonWallet === undefined => don't touch local wallet (TonConnect is still initialising)
  //  - if tonWallet is a string different from wallet => take it (user connected via TonConnect)
  //  - if tonWallet === null (explicitly disconnected) and wallet exists => clear it
  useEffect(() => {
    // if TonConnect hasn't reported yet, skip
    if (typeof tonWallet === "undefined") return;

    if (tonWallet && tonWallet !== wallet) {
      setWallet(tonWallet);
      return;
    }

    if (tonWallet === null && wallet) {
      setWallet(null);
    }
  }, [tonWallet, wallet]);

  // bind wallet to backend session (debounced/throttled)
  useEffect(() => {
    if (!wallet) return;

    // clear any pending timer
    if (bindTimerRef.current) {
      clearTimeout(bindTimerRef.current);
      bindTimerRef.current = null;
    }

    const attemptBind = async () => {
      const now = Date.now();
      // throttle: don't bind more than once every 2s
      if (now - (lastBoundRef.current || 0) < 2000) return;
      lastBoundRef.current = now;
      try {
        await ensureWalletBound(wallet);
      } catch (e) {
        console.error("[WalletContext] bind error", e);
        setError(e?.message || "Failed to bind wallet");
      }
    };

    // debounce slightly so rapid state flips don't trigger multiple binds
    bindTimerRef.current = setTimeout(attemptBind, 300);

    return () => {
      if (bindTimerRef.current) {
        clearTimeout(bindTimerRef.current);
        bindTimerRef.current = null;
      }
    };
  }, [wallet]);

  const disconnect = useCallback(
    async ({ skipTonDisconnect = false } = {}) => {
      try {
        if (!skipTonDisconnect && typeof tonConnectUI !== "undefined" && tonConnectUI) {
          if (typeof tonConnectUI.disconnect === "function") {
            await tonConnectUI.disconnect();
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
    [tonConnectUI]
  );

  const value = useMemo(
    () => ({ wallet, setWallet, disconnect, error, setError }),
    [wallet, error, disconnect]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
