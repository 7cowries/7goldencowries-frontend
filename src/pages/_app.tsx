import type { AppProps } from 'next/app';
import '../styles/globals.css';
import dynamic from 'next/dynamic';

const TonProvider = dynamic(() => import('../context/TonProvider').then(m => m.default), { ssr: false });

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <TonProvider>
      <Component {...pageProps} />
    </TonProvider>
  );
}
