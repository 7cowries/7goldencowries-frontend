import React, { createContext, useContext, useMemo } from 'react';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';

const WalletContext = createContext({ address: null, isConnected: false, connect: () => {}, disconnect: () => {} });

export function WalletProvider({ children }) {
  const address = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  const value = useMemo(() => ({
    address: address || null,
    isConnected: !!address,
    connect: () => tonConnectUI?.openModal(),
    disconnect: () => tonConnectUI?.disconnect()
  }), [address, tonConnectUI]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  return useContext(WalletContext);
}
