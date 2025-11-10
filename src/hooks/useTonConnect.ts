'use client';
import {useWallet} from './useWallet';

export function useTonConnect() {
  const address = useWallet();
  return {
    address,
    isConnected: !!address,
    connected: !!address,
    wallet: address ? { account: { address } } : null
  };
}
export default useTonConnect;
