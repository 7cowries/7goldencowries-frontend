import React, { useEffect, useState } from 'react';

export default function WalletInput() {
  const [value, setValue] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('wallet') || '';
    setValue(saved);
  }, []);

  const onChange = (e) => setValue(e.target.value);
  const onBlur = () => {
    localStorage.setItem('wallet', value.trim());
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
