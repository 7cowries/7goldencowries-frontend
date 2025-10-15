import '../styles.css';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { useMemo } from 'react';

function Provider({ children }) {
  // Build the manifest URL reliably in SSR/CSR
  const manifestUrl = useMemo(() => {
    const base =
      (typeof window === 'undefined'
        ? (process.env.NEXT_PUBLIC_SITE_URL || 'https://7goldencowries.com')
        : window.location.origin);
    return `${base}/tonconnect-manifest.json`;
  }, []);
  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      {children}
    </TonConnectUIProvider>
  );
}

export default function MyApp({ Component, pageProps }) {
  return (
    <Provider>
      <Component {...pageProps} />
    </Provider>
  );
}
