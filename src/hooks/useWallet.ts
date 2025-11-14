import { useCallback, useEffect, useState } from "react";

/**
 * TonConnect UI = single source of truth for wallet.
 * Frontend only. No backend wallet binding required.
 */

declare global {
  interface Window {
    tonConnectUI?: {
      wallet?: { account?: { address?: string } };

      onStatusChange?: (cb: (walletInfo: any | null) => void) => () => void;

      connectWallet?: () => Promise<void>;
      openModal?: () => Promise<void>;
      disconnect?: () => Promise<void>;
    };
  }
}

/** Read address from TonConnect */
function readWalletFromTonConnect(): string | null {
  if (typeof window === "undefined") return null;
  const ui = (window as any).tonConnectUI;
  const addr = ui?.wallet?.account?.address;
  return typeof addr === "string" && addr.length > 0 ? addr : null;
}

export function useWallet() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initial read
    setWallet(readWalletFromTonConnect());

    const ui = (window as any).tonConnectUI;
    let unsubscribe: (() => void) | undefined;
    let pollId: number | undefined;

    if (ui && typeof ui.onStatusChange === "function") {
      // Reactive listener
      unsubscribe = ui.onStatusChange((walletInfo: any | null) => {
        const addr = walletInfo?.account?.address ?? null;
        setWallet(
          typeof addr === "string" && addr.length > 0 ? addr : null
        );
      });
    } else {
      // Poll fallback
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
    if (typeof window === "undefined") return;

    const ui = (window as any).tonConnectUI;
    if (!ui) {
      alert("TonConnect UI is not initialised.");
      return;
    }

    setIsConnecting(true);
    try {
      if (typeof ui.connectWallet === "function") {
        await ui.connectWallet();
      } else if (typeof ui.openModal === "function") {
        await ui.openModal();
      } else {
        console.warn("[useWallet] Missing connectWallet/openModal.");
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (typeof window === "undefined") return;

    const ui = (window as any).tonConnectUI;

    try {
      if (ui && typeof ui.disconnect === "function") {
        await ui.disconnect();
      }
    } catch (err) {
      console.warn("[useWallet] disconnect failed:", err);
    } finally {
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

/** Type for consumers */
export type UseWalletReturn = ReturnType<typeof useWallet>;

/** DEFAULT EXPORT — required for WalletStatus.tsx */
export default useWallet;
