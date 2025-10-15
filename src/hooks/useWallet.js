import { useEffect, useMemo, useState } from "react";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";

/**
 * Safe wallet hook:
 * - Never throws if TonConnect context is missing.
 * - Returns { connected:false } until provider is ready.
 * - Continues to work normally when the provider is present.
 */
export default function useWallet() {
  let tonUI = null;
  let rawAddress = null;
  let contextReady = true;

  try {
    // These will throw if TonConnectUIProvider isn't mounted above.
    [tonUI] = useTonConnectUI();
    rawAddress = useTonAddress();
  } catch (e) {
    contextReady = false;
  }

  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);

  // When context exists, derive state from TonConnect
  useEffect(() => {
    if (!contextReady || !tonUI) {
      setConnected(false);
      setWalletAddress(null);
      return;
    }

    // If an address string is available, consider connected
    if (rawAddress && typeof rawAddress === "string" && rawAddress.length > 0) {
      setConnected(true);
      setWalletAddress(rawAddress);
      return;
    }

    // Guard: also check UI connection status (some versions expose account)
    try {
      const acc = tonUI?.tonConnectUI?.account;
      if (acc?.address) {
        setConnected(true);
        setWalletAddress(acc.address);
      } else {
        setConnected(false);
        setWalletAddress(null);
      }
    } catch {
      setConnected(false);
      setWalletAddress(null);
    }
  }, [contextReady, tonUI, rawAddress]);

  // Actions are safe no-ops if context is missing
  const connect = async () => {
    if (!contextReady || !tonUI?.openModal) return;
    try {
      await tonUI.openModal();
    } catch {}
  };

  const disconnect = async () => {
    if (!contextReady || !tonUI?.disconnect) return;
    try {
      await tonUI.disconnect();
    } catch {}
  };

  return {
    contextReady,
    connected,
    walletAddress,
    connect,
    disconnect,
  };
}
