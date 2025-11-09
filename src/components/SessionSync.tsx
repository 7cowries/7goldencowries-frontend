'use client';

import { useEffect, useRef } from 'react';
import { setSession, clearSession } from '@/lib/session';

type AnyObj = Record<string, any>;

function readWalletHeuristics(): string | null {
  // 1) TonConnect UI (most common)
  try {
    // Some integrations expose a serialized wallet in localStorage
    const raw = localStorage.getItem('ton-connect-ui_wallet');
    if (raw) {
      const p = JSON.parse(raw);
      const addr = p?.account?.address || p?.address;
      if (typeof addr === 'string' && addr.length > 20) return addr;
    }
  } catch {}

  // 2) TonConnect injected globals (when available)
  try {
    const w = (window as AnyObj);
    const addr =
      w?.tonConnectUI?.wallet?.account?.address ||
      w?.tonconnectUI?.wallet?.account?.address ||
      w?.ton?.account?.address ||
      w?.ton?.wallet?.account?.address;
    if (typeof addr === 'string' && addr.length > 20) return addr;
  } catch {}

  return null;
}

function broadcast(wallet: string | null) {
  // Make it trivial for *any* page/component to react without importing anything.
  const root = document.documentElement;
  if (wallet) {
    root.dataset.gcWallet = wallet;
  } else {
    delete root.dataset.gcWallet;
  }

  // Hidden marker element other code can query
  let el = document.getElementById('gc-session');
  if (!el) {
    el = document.createElement('div');
    el.id = 'gc-session';
    el.style.display = 'none';
    document.body.appendChild(el);
  }
  if (wallet) el.setAttribute('data-wallet', wallet);
  else el.removeAttribute('data-wallet');

  window.dispatchEvent(new CustomEvent('gc-session', { detail: { wallet } }));
}

export default function SessionSync() {
  const last = useRef<string | null>(null);

  useEffect(() => {
    // initial read → set cookie if needed
    const current = readWalletHeuristics();
    last.current = current;
    broadcast(current);
    if (current) setSession(current).catch(() => {});

    // 1) Observe localStorage changes (TonConnect UI updates there)
    const onStorage = (e: StorageEvent) => {
      if (!e.key || !e.key.includes('ton-connect-ui')) return;
      const w = readWalletHeuristics();
      if (w !== last.current) {
        last.current = w;
        broadcast(w);
        if (w) setSession(w).catch(() => {});
        else clearSession().catch(() => {});
      }
    };
    window.addEventListener('storage', onStorage);

    // 2) Periodic sanity check (covers providers that don't fire storage)
    const iv = window.setInterval(() => {
      const w = readWalletHeuristics();
      if (w !== last.current) {
        last.current = w;
        broadcast(w);
        if (w) setSession(w).catch(() => {});
        else clearSession().catch(() => {});
      }
    }, 1500);

    // 3) Listen to manual disconnects (some wallets emit)
    const onTonDisconnect = () => {
      last.current = null;
      broadcast(null);
      clearSession().catch(() => {});
    };
    window.addEventListener('ton-disconnect', onTonDisconnect as EventListener);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('ton-disconnect', onTonDisconnect as EventListener);
      window.clearInterval(iv);
    };
  }, []);

  return null;
}
