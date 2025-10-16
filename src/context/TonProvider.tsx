import React, { useEffect, type PropsWithChildren } from 'react';

const TonProvider: React.FC<PropsWithChildren> = ({ children }) => {
  useEffect(() => {
    (async () => {
      try {
        const m: any = await import('../utils/ton');  // JS module; fine to 'any'
        if (typeof m.ensureTonUI === 'function') await m.ensureTonUI();
      } catch {}
    })();
  }, []);

  return <>{children}</>;
};

export default TonProvider;
