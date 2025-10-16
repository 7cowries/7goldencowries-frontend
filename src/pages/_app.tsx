import type { AppProps } from 'next/app';
import '../styles/globals.css';
import dynamic from 'next/dynamic';

// TonProvider is JS/JSX; load on client only
const TonProvider = dynamic(() => import('../context/TonProvider'), { ssr: false });

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <TonProvider>
      <Component {...pageProps} />
    </TonProvider>
  );
}
