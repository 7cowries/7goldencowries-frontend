import { TonConnectUI } from '@tonconnect/ui';

export async function safeConnect(tc: TonConnectUI) {
  try {
    if (tc.connected) return;             // ← prevent re-connecting
    await tc.connectWallet({});           // your existing options here if any
  } catch (e) {
    // Swallow noisy reconnect/abort errors that happen when wallet is already connected or cancels
    // console.debug('[TON_CONNECT] connect ignored:', e);
  }
}
