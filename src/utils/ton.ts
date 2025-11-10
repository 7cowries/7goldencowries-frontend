'use client';
import {useWallet} from '@/hooks/useWallet';

export function useTonAddress(): string {
  return useWallet() ?? '';
}
export function useIsConnected(): boolean {
  return !!useWallet();
}
export default { useTonAddress, useIsConnected };
