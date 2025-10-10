import { useEffect, useState, useMemo } from 'react';
import { TonConnectUI, THEME } from '@tonconnect/ui';

let _ui = null;

/**
 * Ensure a single TonConnectUI instance exists.
 * Uses ENV first, falls back to ABSOLUTE manifest URL (never relative).
 */
export function ensureTonUI(
  manifestUrl = (process.env.REACT_APP_TONCONNECT_MANIFEST_URL || 'https://7goldencowries.com/tonconnect-manifest.json'),
  theme = THEME.DARK
) {
  if (_ui) return _ui;
  _ui = new TonConnectUI({ manifestUrl, theme });
  return _ui;
}

/** Connect via modal */
export async function connectWallet(manifestUrl) {
  const ui = ensureTonUI(manifestUrl);
  await ui.openModal();
}

/** Disconnect */
export async function disconnectWallet() {
  const ui = ensureTonUI();
  try { await ui.disconnect(); } catch {}
}

/** Convenience getter: address if available */
export function getWalletAccount() {
  const ui = ensureTonUI();
  const addr = ui?.wallet?.account?.address || null;
  return addr || null;
}

/**
 * React hook that stays in sync with TonConnect status.
 * Returns: { connected: boolean, address: string|null, ui }
 */
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
      setState({ connected, address, ui });
      try {
        window.dispatchEvent(new CustomEvent('tonconnect:status', { detail: { connected, address } }));
      } catch {}
    });

    return unsubscribe;
  }, [ui]);

  return state;
}

// Back-compat named exports:
export const connect = (manifestUrl) => connectWallet(manifestUrl);
export const disconnect = () => disconnectWallet();


