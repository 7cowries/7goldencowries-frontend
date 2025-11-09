'use client';
import { useEffect, useState } from 'react';

export function useWallet() {
  const [wallet, setWallet] = useState<string | null>(null);

  useEffect(() => {
    const w = (window as any).__GC_WALLET__ as string | null | undefined;
    if (w) setWallet(w);

    const onEvt = (e: Event) => {
      const detail = (e as CustomEvent).detail as { wallet?: string | null } | undefined;
      setWallet(detail?.wallet ?? null);
    };

    window.addEventListener('gc-wallet', onEvt as EventListener);
    return () => window.removeEventListener('gc-wallet', onEvt as EventListener);
  }, []);

  return wallet;
}

export default useWallet;
