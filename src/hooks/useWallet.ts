import { useCallback, useEffect, useState } from "react";

/**
 * We treat TonConnect UI as the single source of truth for the wallet.
 * No more /api/auth/wallet/session or other backend wallet-bind calls.
 */

declare global {
  interface Window {
    tonConnectUI?: {
      wallet?: { account?: { address?: string } };
      /**
       * TonConnect UI v2 style status listener:
       *   const unsubscribe = tonConnectUI.onStatusChange((walletInfo) => {...})
       */
      onStatusChange?: (cb: (walletInfo: any | null) => void) => () => void;

      /**
       * Helper methods – exact names differ per integration, so we
       * defensively support a couple of common ones.
       */
      connectWallet?: () => Promise<void>;
      openModal?: () => Promise<void>;
      disconnect?: () => Promise<void>;
    };
  }
}

/** Helper: read the current wallet address from TonConnect, if any */
function readWalletFromTonConnect(): string | null {
  const ui = (window as any).tonConnectUI;
  const addr = ui?.wallet?.account?.address;
  return typeof addr === "string" && addr.length > 0 ? addr : null;
}

export function useWallet() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Listen to TonConnect UI changes, and also poll as a fallback.
  useEffect(() => {
    // Initial read
    setWallet(readWalletFromTonConnect());

    const ui = (window as any).tonConnectUI;
    let unsubscribe: (() => void) | undefined;
    let pollId: number | undefined;

    if (ui && typeof ui.onStatusChange === "function") {
      // Preferred: reactive updates from TonConnect
      unsubscribe = ui.onStatusChange((walletInfo: any | null) => {
        const addr = walletInfo?.account?.address ?? null;
        setWallet(typeof addr === "string" && addr.length > 0 ? addr : null);
      });
    } else {
      // Fallback: poll every 1.5s
      pollId = window.setInterval(() => {
        setWallet((prev) => {
          const current = readWalletFromTonConnect();
          return current !== prev ? current : prev;
        });
      }, 1500);
    }

    return () => {
      if (unsubscribe) unsubscribe();
      if (pollId) window.clearInterval(pollId);
    };
  }, []);

  const connect = useCallback(async () => {
    const ui = (window as any).tonConnectUI;
    if (!ui) {
      alert("TonConnect UI is not initialised on this page.");
      return;
    }

    setIsConnecting(true);
    try {
      // Some setups use connectWallet, some openModal.
      if (typeof ui.connectWallet === "function") {
        await ui.connectWallet();
      } else if (typeof ui.openModal === "function") {
        await ui.openModal();
      } else {
        console.warn("[useWallet] No connectWallet/openModal found on tonConnectUI.");
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    const ui = (window as any).tonConnectUI;
    try {
      if (ui && typeof ui.disconnect === "function") {
        await ui.disconnect();
      }
    } catch (e) {
      console.warn("[useWallet] TonConnect disconnect failed:", e);
    } finally {
      // In case TonConnect doesn't clear immediately, force local state reset.
      setWallet(null);
    }
  }, []);

  return {
    wallet,
    isConnected: !!wallet,
    isConnecting,
    connect,
    disconnect,
  };
}

export type UseWalletReturn = ReturnType<typeof useWallet>;
