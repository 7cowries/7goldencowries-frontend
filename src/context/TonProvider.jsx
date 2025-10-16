import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import { ensureTonUI, findTonAddress } from '../utils/ton';

const TonCtx = createContext({ address: null, ui: null, ready: false });

export function TonProvider({ children }) {
  const [ui, setUi] = useState(null);
  const [address, setAddress] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancel = false, off = null;
    (async () => {
      const u = await ensureTonUI();
      if (cancel) return;
      setUi(u);
      setAddress(findTonAddress());
      setReady(true);

      // update when wallet status changes
      try { off = u?.onStatusChange?.(() => setAddress(findTonAddress())); } catch {}

      const onStorage = () => setAddress(findTonAddress());
      window.addEventListener('storage', onStorage);
      return () => window.removeEventListener('storage', onStorage);
    })();

    return () => { cancel = true; off && off(); };
  }, []);

  const value = useMemo(() => ({ ui, address, ready }), [ui, address, ready]);
  return <TonCtx.Provider value={value}>{children}</TonCtx.Provider>;
}

export const useTon = () => useContext(TonCtx);
