import { touchSession } from '../utils/session';
import { useEffect, useState, useMemo } from 'react';
import { TonConnectUI, THEME } from '@tonconnect/ui';

let _ui = null;

/** Create/reuse a single TonConnectUI instance */
export function ensureTonUI(
  manifestUrl = (process.env.REACT_APP_TONCONNECT_MANIFEST_URL || 'https://7goldencowries.com/tonconnect-manifest.json'),
  theme = THEME.DARK
) {
  if (_ui) return _ui;
  _ui = new TonConnectUI({ manifestUrl, theme });
  return _ui;
}

/** Open wallet modal */
export async function connectWallet(manifestUrl) {
  const ui = ensureTonUI(manifestUrl);
  await ui.openModal();
}

/** Disconnect wallet (ignore if already disconnected) */
export async function disconnectWallet() {
  const ui = ensureTonUI();
  try { await ui.disconnect(); } catch {}
}

/** Read current wallet address (or null) */
export function getWalletAccount() {
  const ui = ensureTonUI();
  return ui?.wallet?.account?.address || null;
}

/**
 * React hook mirroring TonConnect status.
 * Returns { connected, address, ui, isConnected, account, connect, disconnect, connecting }
 */
export default function useWallet() {
  const ui = useMemo(() => ensureTonUI(), []);
  const [state, setState] = useState(() => ({
    connected: !!ui?.wallet,
    address: ui?.wallet?.account?.address || null,
    ui,
    connecting: false
  }));

  useEffect(() => {
    setState((s) => ({
      ...s,
      connected: !!ui?.wallet,
      address: ui?.wallet?.account?.address || null
    }));

    const unsubscribe = ui.onStatusChange((w) => {
      const connected = !!w;
      const address = w?.account?.address || null;
      setState((s) => ({ ...s, connected, address }));
      try {
        window.dispatchEvent(new CustomEvent('tonconnect:status', { detail: { connected, address } }));
      } catch {}
    });

    return unsubscribe;
  }, [ui]);

  const connect = async () => {
    setState((s) => ({ ...s, connecting: true }));
    try { await connectWallet(); }
    finally { setState((s) => ({ ...s, connecting: false })); }
  };

  const disconnect = async () => {
    setState((s) => ({ ...s, connecting: true }));
    try { await disconnectWallet(); }
    finally { setState((s) => ({ ...s, connecting: false })); }
  };

  return {
    connected: state.connected,
    isConnected: state.connected,
    address: state.address,
    account: state.address,
    ui,
    connect,
    disconnect,
    connecting: state.connecting
  };
}

/* Back-compat aliases (so old code continues to work) */
export const connect = (manifestUrl) => connectWallet(manifestUrl);
export const disconnect = () => disconnectWallet();
