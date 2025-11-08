import type { AppProps } from 'next/app';
import SessionSync from '@/components/SessionSync';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <SessionSync />
      <Component {...pageProps} />
    </>
  );
}
