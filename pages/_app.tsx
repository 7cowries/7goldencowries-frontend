import Head from 'next/head';
import type { AppProps } from 'next/app';
import '@/styles/globals.css';

/* Load ONLY global styles here */
import '../src/App.css';
import '../src/pages/Landing.css';
import '../src/pages/Leaderboard.css';
import '../src/pages/Quests.css';
import '../src/pages/Isles.css';
import '../src/pages/Referral.css';
import '../src/pages/Profile.css';
import '../src/pages/Subscription.css';
import '../src/pages/TokenSale.css';
import '../src/components/ConnectButtons.css';
import '../src/components/XPModal.css';
import '../src/components/layout/Sidebar.css';

import { WalletProvider } from '../src/context/WalletProvider';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#071f34" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <title>7 Golden Cowries</title>
      </Head>
      <WalletProvider>
        <Component {...pageProps} />
      </WalletProvider>
    </>
  );
}
