// src/hooks/useWallet.ts
import { useEffect, useState } from "react";

export type WalletState = {
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

  // 3) Legacy / injected providers (extensions, etc.)
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

function writeDataset(addr: string | null) {
  if (typeof window === "undefined") return;
  try {
    const root = document.documentElement as HTMLElement & {
      dataset: DOMStringMap & { gwallet?: string };
    };
    root.dataset.gwallet = addr || "";
  } catch {
    // ignore
  }
}

const useWalletImpl = (): WalletState => {
  const [wallet, setWallet] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const anyWindow = window as any;

    // Helper: sync React state + <html data-gwallet> from globals
    const syncFromGlobals = () => {
      const addr = readWallet();
      setWallet((prev) => {
        if (prev !== addr) {
          writeDataset(addr);
        }
        return addr;
      });
    };

    // Initial sync
    syncFromGlobals();

    // Listen to our custom event
    const handler = () => {
      syncFromGlobals();
    };
    window.addEventListener("wallet:changed", handler as EventListener);

    // Also subscribe to TonConnect status changes if possible
    let unsubscribe: (() => void) | undefined;
    try {
      const tonconnectUI = anyWindow.tonconnectUI;
      if (tonconnectUI?.onStatusChange) {
        unsubscribe = tonconnectUI.onStatusChange(() => {
          syncFromGlobals();
        });
      }
    } catch {
      // ignore
    }

    // EXTRA SAFETY: poll every 3s so account switches in extensions are picked up
    const intervalId = window.setInterval(syncFromGlobals, 3000);

    return () => {
      window.removeEventListener("wallet:changed", handler as EventListener);
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch {
          // ignore
        }
      }
      clearInterval(intervalId);
    };
  }, []);

  const connect = async () => {
    if (typeof window === "undefined") return;
    const anyWindow = window as any;

    try {
      setConnecting(true);

      // TonConnect UI modal (primary)
      if (anyWindow.tonconnectUI?.openModal) {
        await anyWindow.tonconnectUI.openModal();
      } else if (anyWindow.ton?.connect) {
        // Fallback for injected provider
        await anyWindow.ton.connect();
      }
    } catch (e) {
      console.error("[useWallet] connect error", e);
    } finally {
      setConnecting(false);
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
      if (anyWindow.tonconnectUI?.disconnect) {
        await anyWindow.tonconnectUI.disconnect();
      } else if (anyWindow.ton?.disconnect) {
        await anyWindow.ton.disconnect();
      }
    } catch (e) {
      console.error("[useWallet] disconnect error", e);
    } finally {
      writeDataset(null);
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

export default useWalletImpl;
