import React from "react";

/**
 * Safe, no-crash shim for @tonconnect/ui-react.
 * It renders children and returns inert hooks if the SDK is unavailable.
 */

export const TonConnectUIProvider = ({ children }) => children;

export function useTonAddress() {
  return "";
}

export function useTonConnectUI() {
  // return [ui, controller] like the real hook
  const ui = {};
  const controller = { setOptions: () => {} };
  return [ui, controller];
}
