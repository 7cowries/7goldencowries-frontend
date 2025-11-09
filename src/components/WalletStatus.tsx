'use client';
import useWallet from '@/hooks/useWallet';

export default function WalletStatus() {
  const wallet = useWallet();
  if (!wallet) return <span>Not connected</span>;
  return <span>Connected {wallet.slice(0,4)}…{wallet.slice(-4)}</span>;
}
