import { useEffect, useState, useMemo } from 'react';
import { TonConnectUI, THEME } from '@tonconnect/ui';

let _ui = null;

/** Create (or reuse) a single TonConnectUI instance. */
export function ensureTonUI(
  manifestUrl = (process.env.REACT_APP_TONCONNECT_MANIFEST_URL || 'https://7goldencowries.com/tonconnect-manifest.json'),
  theme = THEME.DARK
) {
  if (_ui) return _ui;
  _ui = new TonConnectUI({ manifestUrl, theme });
  return _ui;
}

/** Open the TonConnect modal */
export async function connectWallet(manifestUrl) {
  const ui = ensureTonUI(manifestUrl);
  await ui.openModal();
}

/** Disconnect if possible (ignore errors) */
export async function disconnectWallet() {
  const ui = ensureTonUI();
  try { await ui.disconnect(); } catch {}
}

/** Get current address or null */
export function getWalletAccount() {
  const ui = ensureTonUI();
  return ui?.wallet?.account?.address || null;
}

/** React hook that tracks TonConnect status and EXPOSES connect/disconnect */
export default function useWallet() {
  const ui = useMemo(() => ensureTonUI(), []);
  const [state, setState] = useState(() => ({
    connected: !!ui?.wallet,
    address: ui?.wallet?.account?.address || null,
    ui
  }));

  useEffect(() => {
    setState({
      connected: !!ui?.wallet,
      address: ui?.wallet?.account?.address || null,
      ui
    });

    const unsubscribe = ui.onStatusChange((w) => {
      const connected = !!w;
      const address = w?.account?.address || null;
      setState(prev => ({ ...prev, connected, address }));
      try {
        window.dispatchEvent(new CustomEvent('tonconnect:status', { detail: { connected, address } }));
      } catch {}
    });

    return unsubscribe;
  }, [ui]);

  // Back-compat: include methods so existing code can do:
  // const { connect, disconnect } = useWallet(); connect();
  const connect = (manifestUrl) => connectWallet(manifestUrl);
  const disconnect = () => disconnectWallet();

  return { ...state, connect, disconnect };
}

// Also export aliases for direct imports if some files use them
export const connect = (manifestUrl) => connectWallet(manifestUrl);
export const disconnect = () => disconnectWallet();
