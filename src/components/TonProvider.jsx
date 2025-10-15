/**
 * TonProvider that never crashes on SSR/build or when the SDK is unavailable.
 * Uses the safeTon shim (a no-op provider in non-browser contexts).
 */
import React from 'react';
import { TonConnectUIProvider } from '../hooks/safeTon';

const manifestUrl =
  process.env.NEXT_PUBLIC_TONCONNECT_MANIFEST_URL ||
  process.env.REACT_APP_TONCONNECT_MANIFEST_URL ||
  (typeof window !== 'undefined'
    ? `${window.location.origin}/tonconnect-manifest.json`
    : '/tonconnect-manifest.json');

export default function TonProvider({ children }) {
  return (
    <TonConnectUIProvider
      manifestUrl={manifestUrl}
      uiPreferences={{ theme: 'DARK' }}
    >
      {children}
    </TonConnectUIProvider>
  );
}
