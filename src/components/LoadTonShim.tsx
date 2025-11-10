'use client';
import { useEffect } from 'react';

export default function LoadTonShim() {
  useEffect(() => {
    let dispose: (() => void) | undefined;
    import('@/utils/ton-shim')
      .then(m => { dispose = m.default?.(); })
      .catch(() => {});
    return () => { try { dispose?.(); } catch {} };
  }, []);
  return null;
}
