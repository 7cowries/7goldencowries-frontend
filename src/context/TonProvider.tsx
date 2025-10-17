'use client';
import React, { useEffect } from 'react';

type Props = { children: React.ReactNode };

function TonProvider({ children }: Props) {
  // If you have a helper that boots TonConnect UI, call it here on the client:
  useEffect(() => {
    (async () => {
      try {
        const mod = await import('../utils/ton');
        // call ensureTonUI if it exists; ignore if not
        (mod as any)?.ensureTonUI?.();
      } catch {}
    })();
  }, []);

  return <>{children}</>;
}

export default TonProvider;
