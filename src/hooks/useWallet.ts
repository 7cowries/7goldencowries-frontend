'use client';
import { useEffect, useState } from 'react';

function readWallet(): string | null {
  try {
    const w = document.documentElement?.dataset?.gcWallet;
    if (typeof w === 'string' && w.length > 20) return w;
  } catch {}
  try {
    const k = ['ton-connect-ui_wallet', 'ton-connect-ui'];
    for (const key of k) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const p = JSON.parse(raw);
      const addr = p?.account?.address || p?.address;
      if (typeof addr === 'string' && addr.length > 20) return addr;
    }
  } catch {}
  try {
    // shims we inject globally
    const a =
      // @ts-ignore
      (globalThis as any).tonconnectUI?.wallet?.account?.address ||
      // @ts-ignore
      (globalThis as any).ton?.wallet?.account?.address;
    if (typeof a === 'string' && a.length > 20) return a;
  } catch {}
  return null;
}

export function useWallet(): string | null {
  const [w, setW] = useState<string | null>(null);

  useEffect(() => {
    const apply = () => setW(readWallet());
    apply();

    const onGc = (e: Event) => {
      const det = (e as CustomEvent)?.detail as { wallet?: string } | undefined;
      if (det?.wallet && det.wallet.length > 20) setW(det.wallet);
      else apply();
    };
    window.addEventListener('gc-session', onGc as EventListener);

    const si = setInterval(apply, 1000); // gentle poll as fallback
    return () => {
      window.removeEventListener('gc-session', onGc as EventListener);
      clearInterval(si);
    };
  }, []);

  return w;
}
