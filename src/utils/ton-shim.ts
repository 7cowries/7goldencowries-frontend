'use client';

type Any = Record<string, any>;

function readWallet(): string | null {
  try {
    // primary source: SessionSync writes to <html data-gc-wallet="...">
    const w = document.documentElement.dataset.gcWallet;
    if (w && w.length > 20) return w;
  } catch {}

  try {
    // fallback: common TonConnect UI localStorage payloads
    for (const k of ['ton-connect-ui_wallet','ton-connect-ui']) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const p = JSON.parse(raw);
      const addr = p?.account?.address || p?.address;
      if (typeof addr === 'string' && addr.length > 20) return addr;
    }
  } catch {}
  return null;
}

function ensurePath(obj: Any, path: string[]): Any {
  let cur = obj;
  for (const key of path) cur = (cur[key] ||= {});
  return cur;
}

function applyToGlobals(addr: string | null) {
  const w = (window as Any);

  // Provide tonconnectUI shape used by some components
  const tc = ensurePath(w, ['tonconnectUI']);
  const tcWallet = ensurePath(tc, ['wallet']);
  const tcAccount = ensurePath(tcWallet, ['account']);
  tcAccount.address = addr || null;

  // Provide generic window.ton shapes some code reads
  const ton = ensurePath(w, ['ton']);
  const tonWallet = ensurePath(ton, ['wallet']);
  const tonWalletAcc = ensurePath(tonWallet, ['account']);
  tonWalletAcc.address = addr || null;

  const tonAcc = ensurePath(ton, ['account']);
  tonAcc.address = addr || null;

  // Tiny convenience flag
  w.TON_WALLET = addr || null;
}

// initialize + keep in sync
(function init() {
  const current = readWallet();
  applyToGlobals(current);

  // react to our broadcast from SessionSync
  window.addEventListener('gc-session', (e: Event) => {
    try {
      const detail = (e as CustomEvent).detail as { wallet?: string|null };
      applyToGlobals(detail?.wallet ?? null);
    } catch {}
  });

  // periodic sanity (covers edge cases that miss events)
  const iv = window.setInterval(() => {
    applyToGlobals(readWallet());
  }, 1200);

  // best-effort cleanup on hot reload
  if (typeof window !== 'undefined') {
    (window as Any).__gcShimCleanup?.();
    (window as Any).__gcShimCleanup = () => window.clearInterval(iv);
  }
})();

export {};
