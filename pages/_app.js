import React from 'react';
import '../styles.css';

import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { WalletProvider } from '@/context/WalletContext';

const manifestUrl = process.env.NEXT_PUBLIC_TONCONNECT_MANIFEST_URL || `${process.env.NEXT_PUBLIC_SITE_URL || ''}/tonconnect-manifest.json`;

export default function App({ Component, pageProps }) {
  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <WalletProvider>
        <Component {...pageProps} />
      </WalletProvider>
    </TonConnectUIProvider>
  );
}
