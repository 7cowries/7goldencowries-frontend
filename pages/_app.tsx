import type { AppProps } from 'next/app';
import SessionSync from '@/components/SessionSync';
import '@/styles/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <SessionSync />
      <Component {...pageProps} />
    </>
  );
}
