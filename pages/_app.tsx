import type { AppProps } from 'next/app';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { ThemeProvider } from '@/theme/ThemeContext';
import '@/styles/globals.css';
import SessionSync from '@/components/SessionSync';

const TonShim = dynamic(() => import('@/components/LoadTonShim'), { ssr: false });

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Hybrid Ocean Web3</title>
      </Head>
      <ThemeProvider>
        <SessionSync />
        <TonShim />
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}
