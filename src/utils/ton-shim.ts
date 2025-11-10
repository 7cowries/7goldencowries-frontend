'use client';

/**
 * Mirrors <html data-gc-wallet="..."> into:
 *  - window.tonconnectUI.wallet.account.address
 *  - window.ton.wallet.account.address
 *  - localStorage['ton-connect-ui_wallet'] (common TonConnect UI cache)
 * and keeps them fresh (listen 'gc-session' + 1s poll).
 */
type Any = Record<string, any>;

function ensurePath(root: Any, path: string[]): Any {
  let cur = root;
  for (const k of path) cur = (cur[k] ||= {});
  return cur;
}

function readFromDom(): string | null {
  try {
    const w = document.documentElement.dataset.gcWallet;
    if (typeof w === 'string' && w.length > 20) return w;
  } catch {}
  try {
    const raw =
      localStorage.getItem('ton-connect-ui_wallet') ||
      localStorage.getItem('ton-connect-ui');
    if (raw) {
      const p = JSON.parse(raw);
      const addr = p?.account?.address || p?.address;
      if (typeof addr === 'string' && addr.length > 20) return addr;
    }
  } catch {}
  return null;
}

function writeTonConnectLS(addr: string | null) {
  try {
    if (!addr) {
      localStorage.removeItem('ton-connect-ui_wallet');
      return;
    }
    const payload = JSON.stringify({ account: { address: addr } });
    localStorage.setItem('ton-connect-ui_wallet', payload);
  } catch {}
}

function applyToGlobals(addr: string | null) {
  const w = window as Any;

  // window.tonconnectUI.wallet.account.address
  const tcu = ensurePath(w, ['tonconnectUI']);
  if (addr) {
    tcu.wallet = ensurePath(tcu, ['wallet']);
    tcu.wallet.account = { ...(tcu.wallet.account || {}), address: addr };
  } else {
    if (tcu.wallet) delete tcu.wallet.account;
  }

  // window.ton.wallet.account.address
  const ton = ensurePath(w, ['ton']);
  if (addr) {
    ton.wallet = ensurePath(ton, ['wallet']);
    ton.wallet.account = { ...(ton.wallet.account || {}), address: addr };
  } else {
    if (ton.wallet) delete ton.wallet.account;
  }

  writeTonConnectLS(addr);
}

function syncOnce() {
  const addr = readFromDom();
  applyToGlobals(addr);
}

(function bootstrap(){
  syncOnce();
  window.addEventListener('gc-session', () => syncOnce());
  const iv = setInterval(syncOnce, 1000);
  window.addEventListener('beforeunload', () => clearInterval(iv));
})();

// Export something so TS treats this as a module for dynamic import
export {};
