import { useEffect, useState } from 'react';

export function useWallet() {
  const [wallet, setWallet] = useState(() => localStorage.getItem('wallet'));

  useEffect(() => {
    const updateWallet = () => {
      setWallet(localStorage.getItem('wallet'));
    };

    window.addEventListener('wallet:changed', updateWallet);
    window.addEventListener('storage', updateWallet);

    return () => {
      window.removeEventListener('wallet:changed', updateWallet);
      window.removeEventListener('storage', updateWallet);
    };
  }, []);

  return { wallet };
}
