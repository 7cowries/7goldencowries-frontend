'use client';

import React from 'react';
import useWallet from '@/hooks/useWallet';

type Props = { showLabel?: boolean; className?: string };

export default function WalletStatus({ showLabel = true, className = '' }: Props) {
  const { wallet, isConnected } = useWallet() as any;

  const short =
    wallet && wallet.length > 8
      ? `${wallet.slice(0, 4)}…${wallet.slice(-4)}`
      : wallet || '';

  return (
    <span className={`wallet-status ${className}`}>
      {isConnected ? (showLabel ? `Connected: ${short}` : short) : 'Wallet disconnected'}
    </span>
  );
}
