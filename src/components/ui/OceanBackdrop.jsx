import React from 'react';

const OceanBackdrop = () => (
  <div
    aria-hidden
    style={{
      position: 'fixed',
      inset: 0,
      background:
        'radial-gradient(circle at 30% 10%, rgba(255,216,107,0.08), transparent 45%), radial-gradient(circle at 70% 90%, rgba(12,60,110,0.45), transparent 40%), linear-gradient(180deg,#041226,#08244a,#0c3c6e)',
      zIndex: 0,
    }}
  />
);

export default OceanBackdrop;
