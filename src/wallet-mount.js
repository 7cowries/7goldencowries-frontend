// Stub file to prevent build errors while migrating wallet mount to be inside TonConnectUIProvider.
// Previously this file mounted a wallet UI into #wallet-root which caused the TonConnect provider
// warning because it ran outside the provider. We created a stub to allow CI/deploy to succeed.
// If you want to remove this, find the import that references './wallet-mount' and delete it.
export default function noopWalletMount() {
  /* no‑op stub */
}
