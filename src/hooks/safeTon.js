export function TonConnectUIProvider({ children }) { return children; }
export function useTonAddress() { return ''; }
export function useTonConnectUI() {
  const ui = {};
  const controller = { setOptions: () => {} };
  return [ui, controller];
}
