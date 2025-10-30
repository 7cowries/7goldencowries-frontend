// bridge file because pages/_app.tsx imports ../src/context/WalletProvider
// but the actual implementation lives in WalletContext.js

export * from './WalletContext.js';

// if WalletContext.js has `export const WalletProvider = ...`
// this makes `import { WalletProvider } ...` work
// and also `import WalletProvider from ...` work
export { WalletProvider as default } from './WalletContext.js';
