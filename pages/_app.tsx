import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import '../src/styles/globals.css';

const TonProvider = dynamic(
  () => import('../src/context/TonProvider').then(m => m.default),
  { ssr: false }
);

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <TonProvider>
      <Component {...pageProps} />
    </TonProvider>
  );
}
