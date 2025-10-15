import { TonConnectUIProvider } from '../hooks/safeTon';

const manifestUrl =
  (process.env.NEXT_PUBLIC_SITE_URL || '') + '/tonconnect-manifest.json';

export default function TonProvider({ children }) {
  return (
    <TonConnectUIProvider
      manifestUrl={manifestUrl}
      uiPreferences={{ theme: 'DARK' }}
    >
      {children}
    </TonConnectUIProvider>
  );
}
