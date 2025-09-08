import { bindWallet, getMe, getQuests } from './api';

export function setupWalletSync() {
  async function sync() {
    const ls = typeof localStorage !== 'undefined' ? localStorage.getItem('wallet') : null;
    const tc = typeof window !== 'undefined' && window.tonconnect?.account?.address;
    const w = ls || tc || null;
    const tasks = [getMe(), getQuests()];
    if (w) {
      tasks.push(
        bindWallet(w).catch((e) => console.error('[init] bind failed', e))
      );
    }
    try {
      await Promise.all(tasks);
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
