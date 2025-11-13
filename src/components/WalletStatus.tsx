'use client';
import React from 'react';
import useWallet from '@/hooks/useWallet';

type Props = {
  showLabel?: boolean;
  className?: string;
};

/**
 * WalletStatus pill that works with:
 * 1) useWallet() returns string | null
 * 2) useWallet() returns { wallet, isConnected }
 */
const WalletStatus: React.FC<Props> = ({ showLabel = true, className = '' }) => {
  const hookResult: any = useWallet();

  const wallet: string | null =
    typeof hookResult === 'string'
      ? hookResult
      : hookResult?.wallet ?? null;

  const isConnected: boolean =
    typeof hookResult === 'object'
      ? Boolean(hookResult?.isConnected || wallet)
      : Boolean(wallet);

  const short =
    wallet && wallet.length > 10
      ? `${wallet.slice(0, 4)}…${wallet.slice(-4)}`
      : wallet || '';

  let label = 'Wallet disconnected';
  if (isConnected && short) {
    label = `Connected: ${short}`;
  } else if (isConnected) {
    label = 'Wallet connected';
  }

  const pillClass = ['wallet-status-pill', isConnected ? 'online' : 'offline', className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={pillClass}>
      <span className="wallet-status-dot" />
      {showLabel && <span className="wallet-status-text">{label}</span>}
    </span>
  );
};

export default WalletStatus;
