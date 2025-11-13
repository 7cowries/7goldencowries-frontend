'use client';

import useWallet from '@/hooks/useWallet';

// Re-export the hook so existing imports from "@/lib/wallet" still work.
export { useWallet };

/**
 * Convenience helper: always returns a wallet address string.
 * If no wallet is connected, returns an empty string.
 */
export function useWalletAddress(): string {
  const state = useWallet() as any;

  const addr =
    state && typeof state.address === 'string'
      ? (state.address as string)
      : '';

  return addr || '';
}
