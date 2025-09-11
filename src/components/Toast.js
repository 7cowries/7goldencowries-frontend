import React from 'react';

export default function Toast({ message, children }) {
  const msg = children ?? message;
  if (!msg) return null;
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        background: '#333',
        color: '#fff',
        padding: '8px 12px',
        borderRadius: 4,
      }}
    >
      {msg}
    </div>
  );
}
