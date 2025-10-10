import { useEffect, useMemo, useRef, useState } from 'react';
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

/** Open connect modal and wait until a wallet is present (best-effort). */
export async function connectWallet(manifestUrl) {
  const ui = ensureTonUI(manifestUrl);
  await ui.openModal();
  // Best-effort: resolve once status flips to connected (or quickly if already connected)
  if (ui?.wallet) return;
  await new Promise((resolve) => {
    const unsub = ui.onStatusChange((w) => {
      if (w) { try { unsub(); } catch {} ; resolve(); }
    });
    // 7s safety timeout
    setTimeout(() => { try { unsub(); } catch {} ; resolve(); }, 7000);
  });
}

/** Disconnect safely */
export async function disconnectWallet() {
  const ui = ensureTonUI();
  try { await ui.disconnect(); } catch {}
}

/** Convenience getter: address (or null) */
export function getWalletAccount() {
  const ui = ensureTonUI();
  return ui?.wallet?.account || null;
}

/**
 * React hook that tracks connection status.
 * Returns: { isConnected, account, address, connect, disconnect, connecting, ui }
 */
export default function useWallet() {
  const ui = useMemo(() => ensureTonUI(), []);
  const [state, setState] = useState(() => ({
    isConnected: !!ui?.wallet,
    account: ui?.wallet?.account || null,
    address: ui?.wallet?.account?.address || null,
    connecting: false,
    ui
  }));
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const update = () => {
      if (!mounted.current) return;
      setState((s) => ({
        ...s,
        isConnected: !!ui?.wallet,
        account: ui?.wallet?.account || null,
        address: ui?.wallet?.account?.address || null,
        ui
      }));
    };
    update();
    const unsubscribe = ui.onStatusChange((_w) => update());
    return () => { mounted.current = false; try { unsubscribe(); } catch {} };
  }, [ui]);

  const connect = async () => {
    setState((s) => ({ ...s, connecting: true }));
    try { await connectWallet(); }
    finally { if (mounted.current) setState((s) => ({ ...s, connecting: false })); }
  };

  const disconnect = async () => {
    setState((s) => ({ ...s, connecting: true }));
    try { await disconnectWallet(); }
    finally { if (mounted.current) setState((s) => ({ ...s, connecting: false })); }
  };

  return { ...state, connect, disconnect };
}

/* ---- Back-compat named exports for legacy code ---- */
export const connect = connectWallet;
export const disconnect = disconnectWallet;
