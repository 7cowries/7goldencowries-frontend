'use client';
import { useEffect, useRef } from 'react';
import { setSession, clearSession } from '@/lib/session';

type Any = Record<string, any>;

function readWallet(): string | null {
  try {
    // common TonConnect UI keys
    for (const k of ['ton-connect-ui_wallet','ton-connect-ui']) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const p = JSON.parse(raw);
      const addr = p?.account?.address || p?.address;
      if (typeof addr === 'string' && addr.length > 20) return addr;
    }
  } catch {}
  try {
    const w = (window as Any);
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
  const root = document.documentElement;
  if (wallet) root.dataset.gcWallet = wallet; else delete root.dataset.gcWallet;

  let el = document.getElementById('gc-session');
  if (!el) {
    el = document.createElement('div');
    el.id = 'gc-session';
    el.style.display = 'none';
    document.body.appendChild(el);
  }
  if (wallet) el.setAttribute('data-wallet', wallet); else el.removeAttribute('data-wallet');

  window.dispatchEvent(new CustomEvent('gc-session', { detail: { wallet } }));
}

export default function SessionSync() {
  const last = useRef<string | null>(null);

  useEffect(() => {
    const apply = (w: string | null) => {
      if (w === last.current) return;
      last.current = w;
      broadcast(w);
      if (w) setSession(w).catch(() => {});
      else clearSession().catch(() => {});
    };

    apply(readWallet());

    const onStorage = (e: StorageEvent) => {
      if (!e.key || !e.key.includes('ton-connect')) return;
      apply(readWallet());
    };
    window.addEventListener('storage', onStorage);

    const iv = window.setInterval(() => apply(readWallet()), 1500);

    const onTonDisconnect = () => apply(null);
    window.addEventListener('ton-disconnect', onTonDisconnect as EventListener);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('ton-disconnect', onTonDisconnect as EventListener);
      window.clearInterval(iv);
    };
  }, []);

  return null;
}
