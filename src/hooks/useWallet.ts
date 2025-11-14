// src/hooks/useWallet.ts
import { useEffect, useState } from "react";

export type WalletState = {
  wallet: string | null;
  isConnected: boolean;

  // Backwards-compatible aliases
  connected: boolean;
  walletAddress: string | null;
  address: string | null;
  rawAddress: string | null;

  contextReady: boolean;

  connect: () => Promise<void> | void;
  disconnect: () => Promise<void> | void;
};

function readFromDataset(): string | null {
  if (typeof document === "undefined") return null;
  try {
    const root = document.documentElement as HTMLElement & {
      dataset: DOMStringMap & { gwallet?: string };
    };
    return root.dataset.gwallet || null;
  } catch {
    return null;
  }
}

function writeToDataset(addr: string | null) {
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

/**
 * Try to read the wallet address from:
 *  1. <html data-gwallet="...">
 *  2. window.tonconnectUI.wallet.account.address
 *  3. window.ton.wallet.account.address
 */
function readWallet(): string | null {
  // 1) Check dataset first (fast + already used by UI)
  const fromDataset = readFromDataset();
  if (fromDataset) return fromDataset;

  // 2) Fallback to TonConnect globals
  if (typeof window === "undefined") return null;

  try {
    const anyWindow = window as any;
    const tonconnectUI = anyWindow.tonconnectUI || anyWindow.tonConnectUI;
    const ton = anyWindow.ton;

    const addr: string | null =
      tonconnectUI?.wallet?.account?.address ||
      tonconnectUI?.account?.address ||
      ton?.wallet?.account?.address ||
      null;

    if (addr && typeof addr === "string" && addr.length > 0) {
      writeToDataset(addr);
      return addr;
    }
  } catch {
    // ignore
  }

  return null;
}

export default function useWallet(): WalletState {
  const [wallet, setWallet] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return readWallet();
  });

  // Keep local state in sync with dataset / TonConnect.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const sync = () => {
      const addr = readWallet();
      setWallet((prev) => (prev === addr ? prev : addr));
    };

    // Initial sync
    sync();

    // Listen for explicit wallet:changed events
    window.addEventListener("wallet:changed", sync as EventListener);

    // And also poll occasionally in case the provider changes silently
    const id = window.setInterval(sync, 1000);

    return () => {
      window.removeEventListener("wallet:changed", sync as EventListener);
      window.clearInterval(id);
    };
  }, []);

  const connect = async () => {
    if (typeof window === "undefined") return;
    try {
      const anyWindow = window as any;
      const tonconnectUI = anyWindow.tonconnectUI || anyWindow.tonConnectUI;
      const ton = anyWindow.ton;

      if (tonconnectUI?.openModal) {
        await tonconnectUI.openModal();
      } else if (ton?.connect) {
        await ton.connect();
      }
    } catch {
      // ignore
    }
  };

  const disconnect = async () => {
    if (typeof window === "undefined") return;
    try {
      const anyWindow = window as any;
      const tonconnectUI = anyWindow.tonconnectUI || anyWindow.tonConnectUI;
      const ton = anyWindow.ton;

      if (tonconnectUI?.disconnect) {
        await tonconnectUI.disconnect();
      }
      if (ton?.disconnect) {
        await ton.disconnect();
      }
    } catch {
      // ignore
    } finally {
      writeToDataset(null);
      setWallet(null);
      try {
        window.dispatchEvent(new Event("wallet:changed"));
      } catch {
        // ignore
      }
    }
  };

  const isConnected = !!wallet;

  const state: WalletState = {
    wallet,
    isConnected,

    connected: isConnected,
    walletAddress: wallet,
    address: wallet,
    rawAddress: wallet,

    contextReady: true,

    connect,
    disconnect,
  };

  // Optionally expose on window for debugging
  if (typeof window !== "undefined") {
    (window as any).gwalletState = state;
  }

  return state;
}
