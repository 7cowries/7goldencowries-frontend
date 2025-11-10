'use client';
import {useWallet} from '@/hooks/useWallet';

export default function WalletStatus() {
  const w = useWallet();
  return <span>{w ? `Connected: ${w.slice(0,6)}…${w.slice(-4)}` : 'Wallet disconnected'}</span>;
}
