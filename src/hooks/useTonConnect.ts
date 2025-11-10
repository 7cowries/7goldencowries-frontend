'use client';
import { useEffect, useState } from 'react';

function readFromDom(): string | null {
  const el = document.getElementById('gc-session');
  const data = el?.getAttribute('data-wallet') || document.documentElement.dataset.gcWallet || null;
  return (data && data.length > 20) ? data : null;
}

export function useTonWallet(): string | null {
  const [w, setW] = useState<string|null>(null);

  useEffect(() => {
    const sync = () => setW(readFromDom());
    sync();
    const onEvt = (e: Event) => {
      // @ts-ignore
      const wallet = (e as CustomEvent)?.detail?.wallet ?? readFromDom();
      setW(wallet ?? null);
    };
    window.addEventListener('gc-session', onEvt as EventListener);
    const iv = window.setInterval(sync, 2000);
    return () => { window.removeEventListener('gc-session', onEvt as EventListener); window.clearInterval(iv); };
  }, []);

  return w;
}

export function useTonConnect() {
  const wallet = useTonWallet();
  return { wallet };
}
export default useTonWallet;
