import LoadTonShim from '@/components/LoadTonShim';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import '@/styles/globals.css';
import "@/utils/ton-shim";
import SessionSync from '@/components/SessionSync';
import ServerWalletInjector from '@/components/ServerWalletInjector';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <LoadTonShim />
      <SessionSync />
      <ServerWalletInjector />
      <Component {...pageProps} />
    </>
  );
}
