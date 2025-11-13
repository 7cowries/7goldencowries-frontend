import { apiPost } from './apiClient';

export async function touchWalletSession(address) {
  if (!address) return;
  try {
    await apiPost('/api/v1/auth/wallet-session', { address });
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') console.warn('touchWalletSession failed', e);
  }
}
