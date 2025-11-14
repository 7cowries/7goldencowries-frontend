'use client';

import React, { useEffect, useState } from 'react';
import useWallet from '@/hooks/useWallet';
import { getMe } from '@/utils/api';

type Props = {
  showLabel?: boolean;
  className?: string;
};

type WalletState = {
  wallet?: string;
  address?: string;
  rawAddress?: string;
  isConnected?: boolean;
};

export default function WalletStatus({
  showLabel = true,
  className = '',
}: Props) {
  // 1) Primary source: TonConnect hook
  const hookState = (typeof useWallet === 'function'
    ? (useWallet() as WalletState | null)
    : null) as WalletState | null;

  // 2) Fallback source: backend /api/me session
  const [backendWallet, setBackendWallet] = useState<string>('');
  const [backendChecked, setBackendChecked] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const me: any = await getMe().catch(() => null);
        if (!me || cancelled) return;

        const w: string =
          me.wallet ||
          me.address ||
          me.tonWallet ||
          me.ton_address ||
          me.tonAddress ||
          '';

        if (!cancelled && w) {
          setBackendWallet(w);
        }
      } finally {
        if (!cancelled) {
          setBackendChecked(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const wallet: string =
    hookState?.wallet ||
    hookState?.address ||
    hookState?.rawAddress ||
    backendWallet ||
    '';

  const isConnected: boolean =
    (!!wallet && wallet.length > 0) || !!hookState?.isConnected;

  const short =
    wallet && wallet.length > 12
      ? `${wallet.slice(0, 4)}…${wallet.slice(-4)}`
      : wallet;

  const label =
    !isConnected && backendChecked
      ? 'Wallet disconnected'
      : isConnected
      ? short || 'Wallet connected'
      : 'Wallet disconnected';

  return (
    <span className={className}>
      {showLabel
        ? label
        : short || (isConnected ? 'Connected' : 'Disconnected')}
    </span>
  );
}
