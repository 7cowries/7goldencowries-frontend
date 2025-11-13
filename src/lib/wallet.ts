'use client';

import useWallet from '@/hooks/useWallet';

// Re-export the hook so existing imports from "@/lib/wallet" still work.
export { useWallet };

/**
 * Convenience helper: always returns a string.
 * When there is no wallet, returns an empty string.
 */
export function useWalletAddress(): string {
  const addr = useWallet();
  return addr ?? '';
}
