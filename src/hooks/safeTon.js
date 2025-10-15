import React from "react";
export const TonConnectUIProvider = ({ children }) => children;
export function useTonAddress() { return ""; }
export function useTonConnectUI() {
  const ui = {}; const controller = { setOptions: () => {} };
  return [ui, controller];
}
