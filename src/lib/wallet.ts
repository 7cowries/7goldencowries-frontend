'use client';

import useWallet from '@/hooks/useWallet';

export { useWallet };

export function useWalletAddress(): string {
  const state: any = useWallet();
  const addr: string | undefined =
    state?.wallet || state?.address || state?.rawAddress;
  return addr || '';
}
