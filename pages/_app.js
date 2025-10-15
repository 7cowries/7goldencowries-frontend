import { safeWindow } from "../src/utils/safeWindow";
safeWindow();
import React from 'react';
import TonProvider from '../src/components/TonProvider';

/* Global CSS must be imported only here */
import '../src/App.css';
import '../src/index.css';
import '../src/styles/theme.css';
import '../src/styles/enchanted.css';

import '../src/pages/Landing.css';
import '../src/pages/Isles.css';
import '../src/pages/Leaderboard.css';
import '../src/pages/Profile.css';
import '../src/pages/Quests.css';
import '../src/pages/Referral.css';
import '../src/pages/Subscription.css';
import '../src/pages/TokenSale.css';

import '../src/components/XPBar.css';
import '../src/components/LeftNav.css';
import '../src/components/layout/AppLayout.css';
import '../src/components/layout/Sidebar.css';
import '../src/components/GlobalWalletButton.css';
import '../src/components/ConnectButtons.css';

export default function MyApp({ Component, pageProps }) {
  return (
    <TonProvider>
      <Component {...pageProps} />
    </TonProvider>
  );
}
