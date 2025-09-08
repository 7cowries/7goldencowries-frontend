import { ensureWalletBound } from './walletBind';
import { bindWallet, getMe, getQuests } from './api';

export function setupWalletSync() {
  let inflight = false;
  let lastBindAt = 0;
  const BIND_COOLDOWN_MS = 4000;
  async function sync() {
    const ls = typeof localStorage !== 'undefined' ? localStorage.getItem('wallet') : null;
    const tc = typeof window !== 'undefined' && window.tonconnect?.account?.address;
    const w = ls || tc || null;
    if (w) {
      try {
        const now = Date.now();
        if (!inflight && now - lastBindAt > BIND_COOLDOWN_MS) {
          inflight = true;
          await ensureWalletBound(w);
          await bindWallet(w);
          lastBindAt = Date.now();
          inflight = false;
        }
      } catch (e) {
        console.error('[init] bind failed', e);
        inflight = false;
      }
    }
    try {
      await Promise.all([getMe(), getQuests()]);
    } catch (e) {
      console.error('[init] preload failed', e);
    }
  }

  sync();
  if (typeof window !== 'undefined') {
    window.addEventListener('wallet:changed', sync);
    window.addEventListener('focus', sync);
    window.addEventListener('profile-updated', sync);
  }
}
