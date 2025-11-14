// src/hooks/useWallet.ts
import { useEffect, useState } from "react";

export type WalletState = {
  wallet: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
};

function getTonAddress(): string | null {
  if (typeof window === "undefined") return null;
  const anyWin = window as any;

  try {
    // Check TonConnect UI context
    const tonUI = anyWin.tonconnectUI || anyWin.TonConnectUI;
    const addr =
      tonUI?.wallet?.account?.address ||
      tonUI?.account?.address ||
      anyWin?.ton?.wallet?.account?.address ||
      anyWin?.ton?.account?.address ||
      null;

    if (addr && typeof addr === "string") {
      document.documentElement.dataset.gwallet = addr;
      return addr;
    }
  } catch {}
  return document.documentElement.dataset?.gwallet || null;
}

export default function useWallet(): WalletState {
  const [wallet, setWallet] = useState<string | null>(() => getTonAddress());
  const [isConnected, setIsConnected] = useState<boolean>(!!wallet);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const sync = () => {
      const addr = getTonAddress();
      setWallet(addr);
      setIsConnected(!!addr);
    };

    sync();

    window.addEventListener("wallet:changed", sync);
    const anyWin = window as any;
    if (anyWin.tonconnectUI) {
      anyWin.tonconnectUI.onStatusChange?.(sync);
    }
    return () => {
      window.removeEventListener("wallet:changed", sync);
    };
  }, []);

  const connect = async () => {
    if (typeof window === "undefined") return;
    const anyWin = window as any;
    try {
      await anyWin.tonconnectUI?.openModal?.();
    } catch (e) {
      console.error("[useWallet] connect error", e);
    }
    setTimeout(() => window.dispatchEvent(new Event("wallet:changed")), 500);
  };

  const disconnect = async () => {
    if (typeof window === "undefined") return;
    const anyWin = window as any;
    try {
      await anyWin.tonconnectUI?.disconnect?.();
      document.documentElement.dataset.gwallet = "";
    } catch (e) {
      console.error("[useWallet] disconnect error", e);
    }
    setWallet(null);
    setIsConnected(false);
    window.dispatchEvent(new Event("wallet:changed"));
  };

  return { wallet, isConnected, connect, disconnect };
}
