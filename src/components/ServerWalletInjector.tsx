'use client';

import { useEffect } from 'react';

type Me = { wallet?: string | null };

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
  if (wallet) el.setAttribute('data-wallet', wallet);
  else el.removeAttribute('data-wallet');

  window.dispatchEvent(new CustomEvent('gc-session', { detail: { wallet } }));
}

async function fetchMe(): Promise<string | null> {
  try {
    const r = await fetch('/api/me', { credentials: 'include' });
    if (!r.ok) return null;
    const j: Me = await r.json();
    return (typeof j?.wallet === 'string' && j.wallet.length > 20) ? j.wallet : null;
  } catch {
    return null;
  }
}

export default function ServerWalletInjector() {
  useEffect(() => {
    let stop = false;

    const tick = async () => {
      if (stop) return;
      const w = await fetchMe();
      // Only push if we don't have one yet or it changed
      const current = document.documentElement.dataset.gcWallet || null;
      if (w !== current) broadcast(w);
    };

    // initial + periodic refresh (covers pages that never touch TonConnect)
    tick();
    const iv = window.setInterval(tick, 2500);

    return () => { stop = true; window.clearInterval(iv); };
  }, []);

  return null;
}
