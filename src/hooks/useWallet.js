import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TonConnectUI, THEME } from '@tonconnect/ui';

let _ui = null;

/** Ensure a single TonConnectUI instance (ENV first, absolute URL fallback). */
export function ensureTonUI(
  manifestUrl = (process.env.REACT_APP_TONCONNECT_MANIFEST_URL || 'https://7goldencowries.com/tonconnect-manifest.json'),
  theme = THEME.DARK
) {
  if (_ui) return _ui;
  _ui = new TonConnectUI({ manifestUrl, theme });
  return _ui;
}

/** Programmatic helpers (also re-exported with alias names for back-compat). */
export async function connectWallet(manifestUrl) {
  const ui = ensureTonUI(manifestUrl);
  await ui.openModal();
}
export async function disconnectWallet() {
  const ui = ensureTonUI();
  try { await ui.disconnect(); } catch {}
}
export function getWalletAccount() {
  const ui = ensureTonUI();
  return ui?.wallet?.account?.address || null;
}

/**
 * React hook for components.
 * Returns: { isConnected, account, connect, disconnect, connecting, ui }
 */
export default function useWallet() {
  const ui = useMemo(() => ensureTonUI(), []);
  const [isConnected, setIsConnected] = useState(!!ui?.wallet);
  const [account, setAccount] = useState(ui?.wallet?.account?.address || null);
  const connecting = useRef(false);

  useEffect(() => {
    setIsConnected(!!ui?.wallet);
    setAccount(ui?.wallet?.account?.address || null);

    const unsubscribe = ui.onStatusChange((w) => {
      const nextConnected = !!w;
      const nextAccount = w?.account?.address || null;
      setIsConnected(nextConnected);
      setAccount(nextAccount);
      try {
        window.dispatchEvent(new CustomEvent('tonconnect:status', {
          detail: { connected: nextConnected, address: nextAccount }
        }));
      } catch {}
    });

    return unsubscribe;
  }, [ui]);

  const connect = useCallback(async () => {
    connecting.current = true;
    try { await ui.openModal(); } finally { connecting.current = false; }
  }, [ui]);

  const disconnect = useCallback(async () => {
    connecting.current = true;
    try { await ui.disconnect(); } finally { connecting.current = false; }
  }, [ui]);

  return { isConnected, account, connect, disconnect, connecting: connecting.current, ui };
}

/** Back-compat aliases so we don't re-export the same names twice */
export { ensureTonUI as ensureTonUIRef,
         connectWallet as connectRef,
         disconnectWallet as disconnectRef,
         getWalletAccount as getWalletAccountRef };
