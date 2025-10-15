import { useEffect, useState } from "react";
import { useTonConnectUI, useTonAddress } from "./hooks/safeTon";

export default function useWallet() {
  let tonUI = null;
  let rawAddress = null;
  let contextReady = true;
  try {
    [tonUI] = useTonConnectUI();
    rawAddress = useTonAddress();
  } catch {
    contextReady = false;
  }

  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    if (!contextReady || !tonUI) {
      setConnected(false);
      setWalletAddress(null);
      return;
    }
    if (rawAddress && typeof rawAddress === "string" && rawAddress.length > 0) {
      setConnected(true);
      setWalletAddress(rawAddress);
      return;
    }
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

  const connect = async () => {
    if (!contextReady || !tonUI?.openModal) return;
    try { await tonUI.openModal(); } catch {}
  };

  const disconnect = async () => {
    if (!contextReady || !tonUI?.disconnect) return;
    try { await tonUI.disconnect(); } catch {}
  };

  return { contextReady, connected, walletAddress, connect, disconnect };
}
