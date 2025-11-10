'use client';
import { useTonWallet } from '@/hooks/useTonConnect';

export default function WalletBadge() {
  const w = useTonWallet();
  const short = w ? `${w.slice(0,6)}…${w.slice(-4)}` : 'disconnected';
  return <span style={{opacity:.9,fontSize:12,padding:'2px 8px',border:'1px solid #3a4b6a',borderRadius:12}}>
    Wallet: {short}
  </span>;
}
