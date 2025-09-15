import { useCallback, useEffect, useMemo, useState } from "react";
import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { useWallet as useWalletContext } from "../context/WalletContext";

const STORAGE_KEYS = ["wallet", "walletAddress", "ton_wallet"];

function readStoredWallet() {
  if (typeof window === "undefined" || !window.localStorage) return null;
  for (const key of STORAGE_KEYS) {
    const value = window.localStorage.getItem(key);
    if (value) return value;
  }
  return null;
}

export function useWallet() {
  const tonWallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const { wallet, setWallet, disconnect: contextDisconnect, error, setError } =
    useWalletContext();
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const stored = readStoredWallet();
    if (stored && stored !== wallet) {
      setWallet(stored);
    }
  }, [wallet, setWallet]);

  useEffect(() => {
    const next = tonWallet?.account?.address || null;
    if (next && next !== wallet) {
      setWallet(next);
    }
    if (!next && !readStoredWallet() && wallet) {
      setWallet(null);
    }
  }, [tonWallet, wallet, setWallet]);

  useEffect(() => {
    if (typeof window === "undefined") return () => {};
    const syncFromStorage = (event) => {
      if (event?.key && event.key !== "wallet") return;
      const stored = readStoredWallet();
      if (!stored && wallet) {
        setWallet(null);
        return;
      }
      if (stored && stored !== wallet) {
        setWallet(stored);
      }
    };
    window.addEventListener("wallet:changed", syncFromStorage);
    window.addEventListener("storage", syncFromStorage);
    return () => {
      window.removeEventListener("wallet:changed", syncFromStorage);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, [wallet, setWallet]);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      setError?.(null);
      await tonConnectUI.openModal();
    } catch (err) {
      console.error("[useWallet] connect error", err);
      setError?.(err?.message || "Failed to connect wallet");
      throw err;
    } finally {
      setConnecting(false);
    }
  }, [tonConnectUI, setError]);

  const disconnect = useCallback(async () => {
    setConnecting(true);
    try {
      setError?.(null);
      await contextDisconnect();
    } catch (err) {
      console.error("[useWallet] disconnect error", err);
      setError?.(err?.message || "Failed to disconnect wallet");
      throw err;
    } finally {
      setConnecting(false);
    }
  }, [contextDisconnect, setError]);

  const state = useMemo(
    () => ({
      wallet: wallet || null,
      account: tonWallet?.account ?? null,
      isConnected: Boolean(wallet),
      connecting,
      connect,
      disconnect,
      error: error || null,
    }),
    [wallet, tonWallet, connecting, connect, disconnect, error]
  );

  return state;
}
