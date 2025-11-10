'use client';
import { useWallet } from '@/hooks/useWallet';

export default function WalletStatus() {
  const w = useWallet();
  if (!w) return <><WalletStatus /></>;
  const short = `${w.slice(0, 6)}…${w.slice(-4)}`;
  return <>Wallet: {short}</>;
}
