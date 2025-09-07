import { ensureWalletBound } from './walletBind';
import { getMe, getQuests } from './api';

export function setupWalletSync() {
  async function sync() {
    const w = typeof localStorage !== 'undefined' ? localStorage.getItem('wallet') : null;
    if (w) {
      try {
        await ensureWalletBound(w);
      } catch (e) {
        console.error('[init] bind failed', e);
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
  }
}
