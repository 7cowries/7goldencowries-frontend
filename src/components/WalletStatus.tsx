'use client';
import React from 'react';
import { useWalletState } from '@/lib/wallet';

type Props = { showLabel?: boolean; className?: string };

export default function WalletStatus({ showLabel = true, className = '' }: Props) {
  const { address, isConnected } = useWalletState();
  const short = address ? `${address.slice(0, 4)}…${address.slice(-4)}` : '';

  if (!isConnected) {
    return <span className={`wallet-status ${className}`}>{showLabel ? 'Wallet disconnected' : ''}</span>;
  }

  return (
    <span className={`wallet-status ${className}`}>
      {showLabel ? 'Connected: ' : null}
      <code className="wallet-chip">{short}</code>
    </span>
  );
}
