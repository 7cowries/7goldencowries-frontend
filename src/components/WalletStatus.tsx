'use client';
import React from 'react';
import { useWallet } from '@/hooks/useWallet';

type Props = { showLabel?: boolean; className?: string };

export default function WalletStatus({ showLabel = true, className }: Props) {
  const { wallet, short } = useWallet();
  const text = wallet
    ? (showLabel ? `Connected: ${short}` : short)
    : (showLabel ? 'Wallet disconnected' : 'disconnected');

  return (
    <span
      className={className}
      style={{ opacity: 0.9, fontSize: 12, padding: '2px 8px', border: '1px solid #3a4b6a', borderRadius: 12 }}
    >
      {text}
    </span>
  );
}
