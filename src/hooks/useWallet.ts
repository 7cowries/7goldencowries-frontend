// src/hooks/useWallet.ts
import { useEffect, useState } from "react";
import { useTonConnectUI, useTonAddress } from "./safeTon";

type WalletState = {
  // Canonical fields used by most pages
  wallet: string | null;
  isConnected: boolean;

  // Extra fields for backwards compatibility
  connected?: boolean;
  walletAddress?: string | null;
  address?: string | null;
  rawAddress?: string | null;
  contextReady?: boolean;

  connect: () => Promise<void> | void;
  disconnect: () => Promise<void> | void;
};

function mirrorToDataset(address: string | null) {
  if (typeof document === "undefined") return;
  try {
    const root = document.documentElement as HTMLElement & {
      dataset: DOMStringMap & { gwallet?: string };
    };
    root.dataset.gwallet = address || "";
  } catch {
    // ignore
  }
}

export default function useWallet(): WalletState {
  let tonUI: any = null;
  let rawAddress: string | null = null;
  let contextReady = true;

  // Safely read TonConnect UI context (SSR-proof via safeTon)
  try {
    [tonUI] = useTonConnectUI();
    rawAddress = useTonAddress();
  } catch {
    contextReady = false;
  }

  const [wallet, setWallet] = useState<string | null>(() => {
    // Initial value on client: try to read from <html data-gwallet="...">
    if (typeof window === "undefined") return null;
    try {
      const root = document.documentElement as HTMLElement & {
        dataset: DOMStringMap & { gwallet?: string };
      };
      return root.dataset.gwallet || null;
    } catch {
      return null;
    }
  });

  // Keep wallet state in sync with TonConnect and mirror into dataset
  useEffect(() => {
    if (!contextReady) {
      setWallet(null);
      mirrorToDataset(null);
      return;
    }

    let addr: string | null = null;

    if (rawAddress && typeof rawAddress === "string" && rawAddress.length > 0) {
      addr = rawAddress;
    } else {
      try {
        const acc =
          tonUI?.tonConnectUI?.account || tonUI?.tonconnectUI?.account;
        addr = acc?.address ?? null;
      } catch {
        addr = null;
      }
    }

    setWallet(addr);
    mirrorToDataset(addr);
  }, [contextReady, tonUI, rawAddress]);

  const connect = async () => {
    if (!contextReady || !tonUI?.openModal) return;
    try {
      await tonUI.openModal();
    } catch {
      // ignore
    }
  };

  const disconnect = async () => {
    try {
      if (contextReady && tonUI?.disconnect) {
        await tonUI.disconnect();
      }
    } catch {
      // ignore
    }
    mirrorToDataset(null);
    setWallet(null);
    if (typeof window !== "undefined") {
      // Let any listeners know the wallet changed
      window.dispatchEvent(new Event("wallet:changed"));
    }
  };

  const isConnected = !!wallet;

  return {
    // Canonical fields
    wallet,
    isConnected,

    // Backwards-compatible aliases
    connected: isConnected,
    walletAddress: wallet,
    address: wallet,
    rawAddress: wallet,
    contextReady,

    connect,
    disconnect,
  };
}
