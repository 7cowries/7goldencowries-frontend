import React, { useEffect, useState } from 'react';

export default function WalletInput() {
  const [value, setValue] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('wallet') || '';
    setValue(saved);
  }, []);

  const onChange = (e) => setValue(e.target.value);
  const onBlur = () => {
    const w = value.trim();
    localStorage.setItem('wallet', w);
    window.dispatchEvent(new CustomEvent('wallet:changed', { detail: { wallet: w } }));
  };

  return (
    <input
      type="text"
      placeholder="wallet"
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      style={{ width: 160, marginLeft: 8 }}
    />
  );
}
