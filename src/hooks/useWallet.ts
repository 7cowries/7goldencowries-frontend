// src/hooks/useWallet.ts
import { useEffect, useState } from "react";

type WalletState = {
  wallet: string | null;
  isConnected: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void> | void;
};

/**
 * Read the current wallet address from any available TonConnect / provider globals
 * plus the <html data-gwallet="..."> attribute.
 */
function readWallet(): string | null {
  // SSR guard
  if (typeof window === "undefined") return null;

  // 1) Preferred: <html data-gwallet="...">
  try {
    const root = document.documentElement as HTMLElement & {
      dataset: DOMStringMap & { gwallet?: string };
    };
    if (root.dataset?.gwallet && root.dataset.gwallet.length > 0) {
      return root.dataset.gwallet;
    }
  } catch {
    // ignore
  }

  const anyWindow = window as any;

  // 2) TonConnect UI instance created from manifest (most reliable)
  try {
    const tonconnectUI = anyWindow.tonconnectUI;
    if (tonconnectUI?.account?.address) {
      return String(tonconnectUI.account.address);
    }
  } catch {
    // ignore
  }

  // 3) Legacy / injected providers
  try {
    const ton = anyWindow.ton;
    if (ton?.wallet?.account?.address) {
      return String(ton.wallet.account.address);
    }
    if (ton?.account?.address) {
      return String(ton.account.address);
    }
  } catch {
    // ignore
  }

  return null;
}

const useWalletImpl = (): WalletState => {
  const [wallet, setWallet] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  // Initial sync + subscribe to changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initial read
    const initial = readWallet();
    setWallet(initial);

    // Helper to mirror into <html data-gwallet="...">
    const writeDataset = (addr: string | null) => {
      try {
        const root = document.documentElement as HTMLElement & {
          dataset: DOMStringMap & { gwallet?: string };
        };
        root.dataset.gwallet = addr || "";
      } catch {
        // ignore
      }
    };

    writeDataset(initial);

    // Handler for our custom "wallet:changed" events
    const handler = () => {
      const addr = readWallet();
      setWallet(addr);
      writeDataset(addr);
    };

    window.addEventListener("wallet:changed", handler as EventListener);

    // Also subscribe directly to TonConnect status changes if available
    let unsubscribe: (() => void) | undefined;
    try {
      const anyWindow = window as any;
      const tonconnectUI = anyWindow.tonconnectUI;
      if (tonconnectUI?.onStatusChange) {
        unsubscribe = tonconnectUI.onStatusChange(() => {
          const addr = readWallet();
          setWallet(addr);
          writeDataset(addr);
        });
      }
    } catch {
      // ignore
    }

    return () => {
      window.removeEventListener("wallet:changed", handler as EventListener);
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const connect = async () => {
    if (typeof window === "undefined") return;
    const anyWindow = window as any;

    try {
      setConnecting(true);

      // TonConnect UI modal (primary path)
      if (anyWindow.tonconnectUI?.openModal) {
        await anyWindow.tonconnectUI.openModal();
      } else if (anyWindow.ton?.connect) {
        // Fallback for injected providers
        await anyWindow.ton.connect();
      }
    } catch (e) {
      console.error("[useWallet] connect error", e);
    } finally {
      setConnecting(false);
      // After connect, let readWallet + subscriptions update state
      try {
        window.dispatchEvent(new Event("wallet:changed"));
      } catch {
        // ignore
      }
    }
  };

  const disconnect = async () => {
    if (typeof window === "undefined") return;
    const anyWindow = window as any;

    try {
      // Ask TonConnect / providers to disconnect
      if (anyWindow.tonconnectUI?.disconnect) {
        await anyWindow.tonconnectUI.disconnect();
      } else if (anyWindow.ton?.disconnect) {
        await anyWindow.ton.disconnect();
      }
    } catch (e) {
      console.error("[useWallet] disconnect error", e);
    } finally {
      // Clear dataset + notify listeners
      try {
        const root = document.documentElement as HTMLElement & {
          dataset: DOMStringMap & { gwallet?: string };
        };
        root.dataset.gwallet = "";
      } catch {
        // ignore
      }

      try {
        window.dispatchEvent(new Event("wallet:changed"));
      } catch {
        // ignore
      }

      setWallet(null);
    }
  };

  return {
    wallet,
    isConnected: !!wallet,
    connecting,
    connect,
    disconnect,
  };
};

// Default export so `import useWallet from "../hooks/useWallet"`
export default useWalletImpl;
export type { WalletState };
