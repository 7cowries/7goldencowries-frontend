import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTonAddress, useTonConnectUI } from '../hooks/safeTon';

export const WalletContext = createContext({
  wallet: null,
  address: null,
  isConnected: false,
  isConnecting: false,
  connect: () => {},
  disconnect: () => {},
});

export function WalletProvider({ children }) {
  const address = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async () => {
    if (!tonConnectUI) return;
    setIsConnecting(true);
    try {
      if (typeof tonConnectUI.openModal === 'function') {
        await tonConnectUI.openModal();
        return;
      }
      if (typeof tonConnectUI.connect === 'function') {
        await tonConnectUI.connect();
      }
    } finally {
      setIsConnecting(false);
    }
  }, [tonConnectUI]);

  const disconnect = useCallback(async () => {
    if (!tonConnectUI) return;
    try {
      if (typeof tonConnectUI.disconnect === 'function') {
        await tonConnectUI.disconnect();
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.warn('[WalletContext] disconnect failed', err);
      }
    }
  }, [tonConnectUI]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (address) {
      window.localStorage?.setItem('wallet', address);
      document.documentElement.dataset.gcWallet = address;
      window.dispatchEvent(new CustomEvent('wallet:changed', { detail: { wallet: address } }));
    } else {
      window.localStorage?.removeItem('wallet');
      document.documentElement.dataset.gcWallet = '';
      window.dispatchEvent(new CustomEvent('wallet:changed', { detail: { wallet: null } }));
    }
  }, [address]);

  const value = useMemo(
    () => ({
      wallet: address || null,
      address: address || null,
      isConnected: !!address,
      isConnecting,
      connect,
      disconnect,
      tonConnectUI,
    }),
    [address, connect, disconnect, isConnecting, tonConnectUI]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  return useContext(WalletContext);
}
