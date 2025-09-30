// src/hooks/useWallet.js
import { useCallback } from "react";
import { useTonConnectUI } from "@tonconnect/ui-react";

/**
 * Backwards-compatible useWallet hook.
 * - Supports code that expects { wallet, isConnected }
 * - Supports code that expects { connected, account }
 * - Exposes connect() and disconnect()
 *
 * Note: useTonConnectUI() returns an array in this codebase ([tonConnectUI]).
 */
export function useWallet() {
  // destructure as array because tests and other files in repo expect that
  const [tonConnectUI] = useTonConnectUI();

  // Derive a simple wallet address string if available
  const walletAddress =
    tonConnectUI?.wallet?.address ||
    tonConnectUI?.account?.address ||
    tonConnectUI?.address ||
    tonConnectUI?.wallet ||
    null;

  // Generic connect wrapper — try common method names used across versions
  const connect = useCallback(() => {
    try {
      if (!tonConnectUI) {
        // eslint-disable-next-line no-console
        console.error("[useWallet] TonConnect UI provider not available:", tonConnectUI);
        return;
      }

      // Prefer openModal if available, otherwise try common alternatives
      if (typeof tonConnectUI.openModal === "function") return tonConnectUI.openModal();
      if (typeof tonConnectUI.open === "function") return tonConnectUI.open();
      if (typeof tonConnectUI.showModal === "function") return tonConnectUI.showModal();
      if (typeof tonConnectUI.show === "function") return tonConnectUI.show();
      if (typeof tonConnectUI.connect === "function") return tonConnectUI.connect();
      if (tonConnectUI.ui && typeof tonConnectUI.ui.open === "function") return tonConnectUI.ui.open();

      // eslint-disable-next-line no-console
      console.error("[useWallet] No known open method found on tonConnectUI. Keys:", Object.keys(tonConnectUI || {}));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[useWallet] connect() threw:", err);
    }
  }, [tonConnectUI]);

  const disconnect = useCallback(() => {
    try {
      if (!tonConnectUI) return;
      if (typeof tonConnectUI.disconnect === "function") return tonConnectUI.disconnect();
      if (tonConnectUI.ui && typeof tonConnectUI.ui.disconnect === "function") return tonConnectUI.ui.disconnect();
      // eslint-disable-next-line no-console
      console.warn("[useWallet] disconnect() not available on provider");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[useWallet] disconnect() threw:", err);
    }
  }, [tonConnectUI]);

  const result = {
    // legacy / pages expectation:
    wallet: walletAddress, // string or null

    // boolean flag many pages use:
    isConnected: !!walletAddress,

    // older naming used by some components/tests:
    connected: !!walletAddress,
    account: tonConnectUI?.account || tonConnectUI?.wallet || null,

    // actions
    connect,
    disconnect,

    // expose raw provider for debugging if needed
    _rawProvider: tonConnectUI,
  };

  return result;
}

export default useWallet;
