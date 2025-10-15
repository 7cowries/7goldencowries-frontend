import '../styles.css';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

export default function App({ Component, pageProps }) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || '';
  // TonConnect manifest must be absolute
  const manifestUrl = site.replace(/\/$/, '') + '/tonconnect-manifest.json';

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <Component {...pageProps} />
    </TonConnectUIProvider>
  );
}
