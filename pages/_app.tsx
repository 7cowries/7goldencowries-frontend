import type { AppProps } from 'next/app';
import SessionSync from '@/src/components/SessionSync';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <SessionSync />
      <Component {...pageProps} />
    </>
  );
}
