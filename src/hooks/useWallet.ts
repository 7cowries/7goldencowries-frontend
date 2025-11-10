'use client';
import {useEffect, useState} from 'react';

function readFromDom(): string | null {
  const el = document.getElementById('gc-session');
  const v = el?.getAttribute?.('data-wallet');
  if (v && v.length > 20) return v;
  const ds = document.documentElement?.dataset?.gcWallet as string|undefined;
  if (ds && ds.length > 20) return ds;
  try {
    const raw = localStorage.getItem('ton-connect-ui_wallet');
    if (raw) {
      const p = JSON.parse(raw);
      const addr = p?.account?.address || p?.address;
      if (typeof addr === 'string' && addr.length > 20) return addr;
    }
  } catch {}
  return null;
}

export function useWallet(): string | null {
  const [w, setW] = useState<string|null>(null);

  useEffect(() => {
    setW(readFromDom());
    const onEv = (e: Event) => {
      const det = (e as CustomEvent).detail as {wallet?:string}|undefined;
      if (det?.wallet) setW(det.wallet);
      else setW(readFromDom());
    };
    window.addEventListener('gc-session', onEv as EventListener);

    const iv = window.setInterval(() => setW(readFromDom()), 1500);
    return () => { window.removeEventListener('gc-session', onEv as EventListener); window.clearInterval(iv); };
  }, []);

  return w;
}
export default useWallet;
