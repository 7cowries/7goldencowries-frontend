export default function initTonShim() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  type Any = Record<string, any>;

  function readWallet(): string | null {
    try {
      const w = document.documentElement?.dataset?.gcWallet;
      if (w && w.length > 20) return w;
    } catch {}
    try {
      for (const k of ['ton-connect-ui_wallet', 'ton-connect-ui']) {
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
    const w = window as Any;

    // Mirror onto window.tonconnectUI*.wallet.account.address
    const tcu = ensurePath(w, ['tonconnectUI']);
    tcu.wallet = tcu.wallet || {};
    tcu.wallet.account = tcu.wallet.account || {};
    tcu.wallet.account.address = addr || null;

    // Some integrations use tonconnectUI (lowercase/alt)
    const tcu2 = ensurePath(w, ['tonConnectUI']);
    tcu2.wallet = tcu2.wallet || {};
    tcu2.wallet.account = tcu2.wallet.account || {};
    tcu2.wallet.account.address = addr || null;

    // Legacy window.ton.wallet.account.address
    const ton = ensurePath(w, ['ton']);
    ton.wallet = ton.wallet || {};
    ton.wallet.account = ton.wallet.account || {};
    ton.wallet.account.address = addr || null;

    // Also place a simple alias
    w.__gcWallet = addr || null;
  }

  function syncOnce() {
    applyToGlobals(readWallet());
  }

  // Initial sync
  syncOnce();

  // React to broadcasts from SessionSync
  const onEvt = (e: Event) => {
    const addr = (e as CustomEvent).detail?.wallet ?? readWallet();
    applyToGlobals(addr || null);
  };
  window.addEventListener('gc-session', onEvt as EventListener);

  // Periodic sanity: some wallets don't emit events/storage
  const iv = window.setInterval(syncOnce, 2000);

  // Return a disposer (in case a caller wants to stop it)
  return () => {
    window.removeEventListener('gc-session', onEvt as EventListener);
    window.clearInterval(iv);
  };
}
