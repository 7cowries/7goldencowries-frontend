import type { AppProps } from 'next/app';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import LoadTonShim from "@/components/LoadTonShim";
import { ThemeProvider } from '../src/theme/ThemeContext';

import '../src/styles/globals.css';
import SessionSync from '@/components/SessionSync';

// Load the TON shim only on the client (prevents SSR touching window)
const TonShim = dynamic(() => import('@/components/LoadTonShim'), { ssr: false });

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <LoadTonShim />

      <SessionSync />
      <TonShim />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
