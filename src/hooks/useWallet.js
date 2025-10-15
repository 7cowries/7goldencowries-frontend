// src/hooks/useWallet.js
import { useCallback, useMemo } from "react";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";

/**
 * Minimal wallet hook for TonConnect UI.
 * Exposes: address, isConnected, connect(), disconnect(), tonConnectUI
 */
export default function useWallet() {
  const [tonConnectUI] = useTonConnectUI();
  const address = useTonAddress(); // empty string when not connected
  const isConnected = !!address;

  const connect = useCallback(async () => {
    await tonConnectUI.connectWallet();
  }, [tonConnectUI]);

  const disconnect = useCallback(async () => {
    await tonConnectUI.disconnect();
  }, [tonConnectUI]);

  return useMemo(
    () => ({ address, isConnected, connect, disconnect, tonConnectUI }),
    [address, isConnected, connect, disconnect, tonConnectUI]
  );
}
