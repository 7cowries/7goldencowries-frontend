'use client';

import useWallet from '@/hooks/useWallet';

/**
 * Re-export default hook for convenience.
 * NOTE: The default export from "@/hooks/useWallet" returns either:
 *   - string|null (legacy), or
 *   - { wallet?: string|null; address?: string|null; isConnected?: boolean } (new)
 */
export { default as useWallet } from '@/hooks/useWallet';

/** Always return a string address ('' when not connected). */
export function useWalletAddress(): string {
  const w: any = useWallet();
  if (typeof w === 'string' || w == null) return w ?? '';
  return (w.wallet ?? w.address ?? '') as string;
}

/** Return a normalized shape used across components. */
export function useWalletState(): { address: string; isConnected: boolean } {
  const w: any = useWallet();
  if (typeof w === 'string' || w == null) {
    const address = w ?? '';
    return { address, isConnected: !!address };
  }
  const address: string = (w.wallet ?? w.address ?? '') as string;
  const isConnected: boolean = Boolean(w.isConnected ?? !!address);
  return { address, isConnected };
}
