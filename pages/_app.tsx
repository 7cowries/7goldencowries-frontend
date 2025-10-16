import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { TonProvider } from '../src/context/TonProvider';

const WalletConnect = dynamic(() => import('../src/components/WalletConnect'), { ssr: false });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <TonProvider>
      <Component {...pageProps} />
      {/* site-wide fallback connect button */}
      <div style={{ position:'fixed', left:12, bottom:12, zIndex:1000 }}>
        <WalletConnect compact />
      </div>
    </TonProvider>
  );
}
