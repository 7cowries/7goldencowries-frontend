'use client';
import { useEffect } from 'react';

export default function LoadTonShim() {
  useEffect(() => {
    import('@/utils/ton-shim').catch(() => {});
  }, []);
  return null;
}
