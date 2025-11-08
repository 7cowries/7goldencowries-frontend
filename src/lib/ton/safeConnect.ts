import { TonConnectUI } from '@tonconnect/ui';

export async function safeConnect(tc: TonConnectUI) {
  try {
    if (tc.connected) return;
    await tc.connectWallet();                           // no-arg version

    const wallet = tc.account?.address;
    if (wallet) {
      await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ wallet })
      }).catch(() => {});
      // If you use SWR/React Query in the app, uncomment next line to refresh UI:
      // ;(await import('swr')).mutate('/api/me');
    }
  } catch {
    // ignore benign abort/cancel errors
  }
}
