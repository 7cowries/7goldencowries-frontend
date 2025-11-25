import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import '../styles/globals.css';
import { ThemeProvider } from '../theme/ThemeContext';

const TonProvider = dynamic(
  () => import('../context/TonProvider').then((m) => m.default),
  { ssr: false }
);

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <TonProvider>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </TonProvider>
  );
}
