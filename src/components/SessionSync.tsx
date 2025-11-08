'use client';
import { useEffect, useRef } from 'react';
import { setSession, clearSession } from '@/src/lib/session';

/**
 * Heuristic readers for wallet address from various TON Connect sources.
 * We use both postMessage payloads and best-effort globals.
 */
function pickAddressFromAny(data: any): string | null {
  // message payload shapes we observed:
  //  { event: 'connect', payload: { address: '...', account: { address: '...' } } }
  const p = data?.payload ?? data;
  const a = p?.address ?? p?.account?.address ?? p?.account?.address?.toString?.();
  if (a && typeof a === 'string' && a.trim()) return a;
  return null;
}

function readRestoredAddress(): string | null {
  // Try common globals/localStorage keys defensively
  const w: any = (globalThis as any);
  if (w?.tonConnectUI?.account?.address) return w.tonConnectUI.account.address;

  try {
    // Some builds store under "ton-connect-ui_wallet" / "tonconnect" etc.
    const keys = Object.keys(localStorage || {});
    for (const k of keys) {
      if (!/ton[-_]?connect/i.test(k)) continue;
      const val = localStorage.getItem(k);
      if (!val) continue;
      const obj = JSON.parse(val);
      const addr =
        obj?.account?.address ??
        obj?.wallet?.account?.address ??
        obj?.address;
      if (addr && typeof addr === 'string') return addr;
    }
  } catch {}
  return null;
}

export default function SessionSync() {
  const lastSent = useRef<string | null>(null);
  const syncedOnce = useRef(false);

  useEffect(() => {
    // 1) One-shot sync on mount (restored session)
    if (!syncedOnce.current) {
      const addr = readRestoredAddress();
      if (addr && addr !== lastSent.current) {
        lastSent.current = addr;
        setSession(addr);
      }
      syncedOnce.current = true;
    }

    // 2) Listen to TON Connect SDK window messages
    const onMsg = (ev: MessageEvent) => {
      const data: any = ev?.data;
      if (!data || typeof data !== 'object') return;

      // Normalize event name
      const evt = (data.event || data.type || '').toString();

      if (evt === 'connect') {
        const addr = pickAddressFromAny(data);
        if (addr && addr !== lastSent.current) {
          lastSent.current = addr;
          setSession(addr);
        }
      } else if (evt === 'disconnect') {
        lastSent.current = null;
        clearSession();
      }
    };

    window.addEventListener('message', onMsg, true);
    return () => window.removeEventListener('message', onMsg, true);
  }, []);

  return null;
}
