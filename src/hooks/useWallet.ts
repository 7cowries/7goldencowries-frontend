// src/hooks/useWallet.ts
import { useEffect, useState } from "react";
import { useTonConnectUI, useTonAddress } from "./safeTon";

export type WalletState = {
  wallet: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
};

function setGlobalWallet(addr: string | null) {
  if (typeof document === "undefined") return;
  try {
    const root = document.documentElement as HTMLElement & {
      dataset: DOMStringMap & { gwallet?: string };
    };
    root.dataset.gwallet = addr || "";
  } catch {
    // ignore
  }
}

export default function useWallet(): WalletState {
  // Read from TonConnect UI React hooks (same source as the sidebar)
  let tonUI: any = null;
  let rawAddress: string | null = null;
  let contextReady = true;

  try {
    [tonUI] = useTonConnectUI();
    rawAddress = useTonAddress();
  } catch {
    contextReady = false;
  }

  const [wallet, setWallet] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!contextReady || !tonUI) {
      setIsConnected(false);
      setWallet(null);
      setGlobalWallet(null);
      return;
    }

    // 1) Prefer the hook address
    if (rawAddress && typeof rawAddress === "string" && rawAddress.length > 0) {
      setIsConnected(true);
      setWallet(rawAddress);
      setGlobalWallet(rawAddress);
      window.dispatchEvent(new Event("wallet:changed"));
      return;
    }

    // 2) Fallback: read from TonConnect UI instance
    try {
      const acc =
        tonUI?.tonConnectUI?.account ||
        tonUI?.account ||
        tonUI?.wallet?.account;

      if (acc?.address && typeof acc.address === "string") {
        setIsConnected(true);
        setWallet(acc.address);
        setGlobalWallet(acc.address);
        window.dispatchEvent(new Event("wallet:changed"));
      } else {
        setIsConnected(false);
        setWallet(null);
        setGlobalWallet(null);
      }
    } catch {
      setIsConnected(false);
      setWallet(null);
      setGlobalWallet(null);
    }
  }, [contextReady, tonUI, rawAddress]);

  const connect = async () => {
    if (!contextReady || !tonUI?.openModal) return;
    try {
      await tonUI.openModal();
    } catch (e) {
      console.error("[useWallet] connect error", e);
    }
  };

  const disconnect = async () => {
    if (!contextReady || !tonUI?.disconnect) return;
    try {
      await tonUI.disconnect();
    } catch (e) {
      console.error("[useWallet] disconnect error", e);
    }
    setIsConnected(false);
    setWallet(null);
    setGlobalWallet(null);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("wallet:changed"));
    }
  };

  return { wallet, isConnected, connect, disconnect };
}
