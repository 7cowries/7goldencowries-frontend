// src/hooks/useWallet.js
import { useCallback } from "react";
import { useTonConnectUI } from "@tonconnect/ui-react";

/**
 * Lightweight wallet helper using TonConnect UI React provider.
 */
export function useWallet() {
  const [tonConnectUI] = useTonConnectUI();

  const connect = useCallback(() => {
    try {
      if (tonConnectUI && typeof tonConnectUI.openModal === "function") {
        tonConnectUI.openModal();
      } else {
        console.error("[useWallet] openModal() not available on tonConnectUI", tonConnectUI);
      }
    } catch (err) {
      console.error("Failed to open TonConnect modal:", err);
    }
  }, [tonConnectUI]);

  const disconnect = useCallback(() => {
    try {
      tonConnectUI.disconnect();
    } catch (err) {
      console.error("Failed to disconnect wallet:", err);
    }
  }, [tonConnectUI]);

  return {
    connected: tonConnectUI?.connected,
    account: tonConnectUI?.account,
    connect,
    disconnect,
  };
}

export default useWallet;
