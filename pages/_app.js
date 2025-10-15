import TonProvider from '../src/components/TonProvider';
import '../styles.css'; // keep if you already import globals; ignore if absent

export default function MyApp({ Component, pageProps }) {
  return (
    <TonProvider>
      <Component {...pageProps} />
    </TonProvider>
  );
}
