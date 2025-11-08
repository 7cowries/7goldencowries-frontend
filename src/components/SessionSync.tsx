'use client';
import { useEffect, useRef } from 'react';
import { setSession, clearSession } from '@/lib/session';

function readTonAddress(): string | null {
  try {
    const raw = localStorage.getItem('ton-connect-ui_last-wallet');
    if (raw) {
      const j = JSON.parse(raw);
      return j?.account?.address || null;
    }
  } catch {}
  try {
    const acc = (window as any)?.tonConnectUI?.account;
    return acc?.address || null;
  } catch {}
  return null;
}

export default function SessionSync() {
  const last = useRef<string | null>(null);

  useEffect(() => {
    const sync = async () => {
      const addr = readTonAddress();
      if (addr && addr !== last.current) {
        last.current = addr;
        await setSession(addr);
      } else if (!addr && last.current) {
        last.current = null;
        await clearSession();
      }
    };
    // initial + periodic (cheap)
    sync();
    const iv = setInterval(sync, 2000);
    return () => clearInterval(iv);
  }, []);

  return null;
}
