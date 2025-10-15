import '../src/components/XPModal.css';
import '../src/components/ConnectButtons.css';
import '../src/App.css';
import '../src/index.css';
import { TonConnectUIProvider } from '../src/hooks/safeTon';

const manifestUrl =
  process.env.NEXT_PUBLIC_TONCONNECT_MANIFEST_URL ||
  `${process.env.NEXT_PUBLIC_SITE_URL || ''}/tonconnect-manifest.json`;

export default function MyApp({ Component, pageProps }) {
  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <Component {...pageProps} />
    </TonConnectUIProvider>
  );
}
