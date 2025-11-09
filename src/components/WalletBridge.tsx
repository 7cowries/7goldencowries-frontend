'use client';

import { useEffect } from 'react';

type Any = Record<string, any>;

function stamp(wallet: string | null) {
  // 1) dataset on <html> for CSS/DOM consumers
  const root = document.documentElement;
  if (wallet) root.dataset.gcWallet = wallet;
  else delete root.dataset.gcWallet;

  // 2) global var for legacy code
  (window as Any).__GC_WALLET__ = wallet;

  // 3) fire a friendly event any code can listen to
  window.dispatchEvent(new CustomEvent('gc-wallet', { detail: { wallet } }));
}

async function probeMe(): Promise<string | null> {
  try {
    const r = await fetch('/api/me', { credentials: 'include' });
    if (!r.ok) return null;
    const j = await r.json();
    const w = j?.wallet;
    return typeof w === 'string' && w.length > 20 ? w : null;
  } catch {
    return null;
  }
}

export default function WalletBridge() {
  useEffect(() => {
    let alive = true;

    // 1) initial probe from server session
    probeMe().then((w) => alive && stamp(w));

    // 2) react when SessionSync posts/clears the cookie
    const onGcSession = (e: Event) => {
      const detail = (e as CustomEvent).detail as { wallet?: string | null } | undefined;
      const w = detail?.wallet ?? null;
      stamp(w);
    };
    window.addEventListener('gc-session', onGcSession as EventListener);

    // 3) fall back: periodic re-check (covers tab restores)
    const iv = window.setInterval(() => {
      probeMe().then((w) => alive && stamp(w));
    }, 3000);

    // 4) if TonConnect SDK is present, subscribe to connect/disconnect
    try {
      const w = (window as Any);
      const api = w.tonConnectUI || w.tonconnectUI || w.ton;
      if (api?.onStatusChange) {
        api.onStatusChange((state: Any) => {
          const addr =
            state?.wallet?.account?.address ||
            state?.account?.address ||
            state?.address ||
            null;
          stamp(typeof addr === 'string' && addr.length > 20 ? addr : null);
        });
      }
    } catch {}

    return () => {
      alive = false;
      window.removeEventListener('gc-session', onGcSession as EventListener);
      window.clearInterval(iv);
    };
  }, []);

  return null;
}
