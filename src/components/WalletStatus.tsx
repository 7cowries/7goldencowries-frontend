'use client';

import React from 'react';
import useWallet from '@/hooks/useWallet';

type Props = {
  showLabel?: boolean;
  className?: string;
};

export default function WalletStatus({
  showLabel = true,
  className = '',
}: Props) {
  const state: any = useWallet();
  const wallet: string =
    state?.wallet || state?.address || state?.rawAddress || '';
  const isConnected: boolean = !!wallet && !!state?.isConnected;

  const short =
    wallet && wallet.length > 12
      ? `${wallet.slice(0, 4)}…${wallet.slice(-4)}`
      : wallet;

  const label = !isConnected
    ? 'Wallet disconnected'
    : short || 'Wallet connected';

  return (
    <span className={className}>
      {showLabel ? label : short || (isConnected ? 'Connected' : 'Disconnected')}
    </span>
  );
}
