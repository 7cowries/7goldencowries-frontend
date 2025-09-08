import { bindWallet, getMe, getQuests } from './api';

export function setupWalletSync() {
  async function sync() {
    const ls = typeof localStorage !== 'undefined' ? localStorage.getItem('wallet') : null;
    const tc = typeof window !== 'undefined' && window.tonconnect?.account?.address;
    const w = ls || tc || null;
    if (w) {
      try {
        await bindWallet(w);
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
