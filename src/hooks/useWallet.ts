'use client';
import { useEffect, useState } from 'react';

function readWallet(): string | null {
  try {
    const w = (document?.documentElement?.dataset as any)?.gcWallet;
    if (typeof w === 'string' && w.length > 20) return w;
  } catch {}
  try {
    const a =
      (globalThis as any)?.tonconnectUI?.wallet?.account?.address ||
      (globalThis as any)?.ton?.wallet?.account?.address;
    if (typeof a === 'string' && a.length > 20) return a;
  } catch {}
  try {
    for (const k of ['ton-connect-ui_wallet', 'ton-connect-ui']) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const p = JSON.parse(raw);
      const addr = p?.account?.address || p?.address;
      if (typeof addr === 'string' && addr.length > 20) return addr;
    }
  } catch {}
  return null;
}

export function useWallet() {
  const [wallet, setWallet] = useState<string | null>(null);

  useEffect(() => {
    const apply = () => setWallet(readWallet());
    apply();

    const onGc = () => apply();
    window.addEventListener('gc-session', onGc as any);

    const id = setInterval(apply, 1000);
    return () => {
      window.removeEventListener('gc-session', onGc as any);
      clearInterval(id);
    };
  }, []);

  const short = wallet ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}` : '';
  return { wallet, short, isConnected: !!wallet };
}

export default useWallet; // also export default to avoid import mismatches
