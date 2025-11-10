'use client';
import { useEffect } from 'react';

export default function LoadTonShim() {
  useEffect(() => {
    // import at runtime on the client only
    import('@/utils/ton-shim').catch(() => {});
  }, []);
  return null;
}
