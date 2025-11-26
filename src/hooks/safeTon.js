import React from 'react';

let TonConnectUIProviderImpl = ({ children }) => <>{children}</>;
let TonConnectButtonImpl = (props) => <button {...props}>Connect Wallet</button>;
let useTonAddressImpl = () => '';
let useTonConnectUIImpl = () => [{}, { setOptions: () => {} }];

try {
  // Require at runtime so SSR/build steps never crash when window is undefined.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const sdk = require('@tonconnect/ui-react');
  TonConnectUIProviderImpl = sdk?.TonConnectUIProvider || TonConnectUIProviderImpl;
  TonConnectButtonImpl = sdk?.TonConnectButton || TonConnectButtonImpl;
  useTonAddressImpl = sdk?.useTonAddress || useTonAddressImpl;
  useTonConnectUIImpl = sdk?.useTonConnectUI || useTonConnectUIImpl;
} catch (err) {
  // In non-browser contexts we fall back to harmless no-ops.
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.warn('[safeTon] TonConnect SDK unavailable, using fallback.', err);
  }
}

export const TonConnectUIProvider = TonConnectUIProviderImpl;
export const TonConnectButton = TonConnectButtonImpl;
export const useTonAddress = useTonAddressImpl;
export const useTonConnectUI = useTonConnectUIImpl;
