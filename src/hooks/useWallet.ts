// src/hooks/useWallet.ts
import { useEffect, useState } from "react";

type WalletState = {
  wallet: string | null;
  isConnected: boolean;
  disconnect: () => void;
};

function readWallet(): string | null {
  // Guard for SSR
  if (typeof window === "undefined") {
    try {
      const root = document.documentElement as HTMLElement & {
        dataset: DOMStringMap & { gwallet?: string };
      };
      return root.dataset?.gwallet || null;
    } catch {
      return null;
    }
  }

  try {
    const root = document.documentElement as HTMLElement & {
      dataset: DOMStringMap & { gwallet?: string };
    };
    if (root.dataset?.gwallet) {
      return root.dataset.gwallet;
    }
  } catch {
    // ignore
  }

  const anyWindow = window as any;
  const tonconnectUI = anyWindow.tonconnectUI;
  const ton = anyWindow.ton;

  const addr =
    tonconnectUI?.wallet?.account?.address || ton?.wallet?.account?.address;

  if (typeof addr === "string" && addr.length > 0) {
    // also mirror into dataset so other code (WalletStatus, etc.) can read it
    try {
      const root = document.documentElement as HTMLElement & {
        dataset: DOMStringMap & { gwallet?: string };
      };
      root.dataset.gwallet = addr;
    } catch {
      // ignore
    }
    return addr;
  }

  return null;
}

const useWalletImpl = (): WalletState => {
  const [wallet, setWallet] = useState<string | null>(() => {
    // Initial value on the client
    if (typeof window === "undefined") return null;
    return readWallet();
  });

  // Keep in sync with gwallet + tonconnect events
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = () => {
      setWallet(readWallet());
    };

    // Immediate sync (in case gwallet was updated before mount)
    handler();

    window.addEventListener("wallet:changed", handler as EventListener);
    return () => {
      window.removeEventListener("wallet:changed", handler as EventListener);
    };
  }, []);

  const disconnect = () => {
    try {
      if (typeof window !== "undefined") {
        const anyWindow = window as any;

        // Ask TonConnect UI / injected provider to disconnect
        anyWindow.tonconnectUI?.disconnect?.();
        anyWindow.ton?.disconnect?.();

        try {
          const root = document.documentElement as HTMLElement & {
            dataset: DOMStringMap & { gwallet?: string };
          };
          root.dataset.gwallet = "";
        } catch {
          // ignore
        }

        // notify listeners (Profile, Subscription, etc.)
        window.dispatchEvent(new Event("wallet:changed"));
      }
    } catch (e) {
      console.error("[useWallet] disconnect error", e);
    } finally {
      setWallet(null);
    }
  };

  return {
    wallet,
    isConnected: !!wallet,
    disconnect,
  };
};

// IMPORTANT: default export so `import useWallet from "../hooks/useWallet"`
export default useWalletImpl;
