'use client';

import useWallet from '@/hooks/useWallet';
export { useWallet };

export function useWalletAddress(): string {
  const { wallet } = useWallet() as any;
  return wallet || "";
}
