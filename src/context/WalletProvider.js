// Bridge file so Next pages/_app.tsx import matches the CRA codebase.
// Re-export everything from the real implementation:
export * from './WalletContext.js';
export { WalletProvider as default } from './WalletContext.js';
