import '../styles.css';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

export default function App({ Component, pageProps }) {
  // Prefer an explicit manifest URL if provided via env
  const manifestUrl =
    process.env.NEXT_PUBLIC_TONCONNECT_MANIFEST_URL ||
    process.env.REACT_APP_TONCONNECT_MANIFEST_URL ||
    (() => {
      const site =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== 'undefined' ? window.location.origin : '');
      return site.replace(/\/$/, '') + '/tonconnect-manifest.json';
    })();

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <Component {...pageProps} />
    </TonConnectUIProvider>
  );
}
