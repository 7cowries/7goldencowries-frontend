import Head from 'next/head';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#071f34" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <title>7 Golden Cowries</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}
