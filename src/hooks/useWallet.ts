'use client';
import { useEffect, useState } from 'react';

export default function useWallet() {
  const [wallet, setWallet] = useState<string | null>(null);

  // 1) read server (cookie) once on mount
  useEffect(() => {
    fetch('/api/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : { wallet: null })
      .then(d => setWallet(d.wallet ?? null))
      .catch(() => {});
  }, []);

  // 2) react instantly to SessionSync broadcasts
  useEffect(() => {
    const onEvt = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      if (detail && 'wallet' in detail) setWallet(detail.wallet || null);
    };
    window.addEventListener('gc-session', onEvt as EventListener);
    return () => window.removeEventListener('gc-session', onEvt as EventListener);
  }, []);

  return wallet;
}
