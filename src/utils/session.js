import { API_URLS, postJSON } from './api';

export async function touchWalletSession(address) {
  if (!address) return;
  try {
    await postJSON(API_URLS.auth.walletSession, { address });
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') console.warn('touchWalletSession failed', e);
  }
}
