// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import WalletProvider from "./context/WalletContext";
import './styles/polish.css';
import './styles/theme.css';
import { setupWalletSync } from './utils/init';
import { captureReferralFromQuery } from './utils/referral';

// Prefer an env override; otherwise use the local manifest served from /public
const manifestUrl =
  process.env.REACT_APP_TONCONNECT_MANIFEST_URL ||
  `${window.location.origin}/tonconnect-manifest.json`;

captureReferralFromQuery();

const root = ReactDOM.createRoot(document.getElementById("root"));

// Enable colorful “Ocean Light”
document.body.classList.add('theme-ocean-light');

setupWalletSync();

root.render(
  <React.StrictMode>
    <TonConnectUIProvider
      manifestUrl={manifestUrl}
      uiPreferences={{ theme: "DARK" }} // 'LIGHT' | 'DARK' | 'SYSTEM'
      restoreConnection
      language="en"
    >
      <WalletProvider>
        <App />
      </WalletProvider>
    </TonConnectUIProvider>
  </React.StrictMode>
);

