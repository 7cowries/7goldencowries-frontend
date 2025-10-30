import React from 'react';

type WalletProviderProps = {
  children: React.ReactNode;
};

/**
 * TEMP wallet provider so Next.js build can find ../src/context/WalletProvider
 * Replace later with the real TonConnect / wallet context.
 */
export const WalletProvider = ({ children }: WalletProviderProps) => {
  return <>{children}</>;
};

export default WalletProvider;
