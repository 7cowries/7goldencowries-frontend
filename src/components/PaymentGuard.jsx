// src/components/PaymentGuard.jsx
'use client';

import React, { useEffect, useState } from 'react';
import useWallet from '@/hooks/useWallet';
import { getSubscriptionStatus } from '../utils/api';

export default function PaymentGuard({
  children,
  loadingFallback = null,
}) {
  const state = useWallet();
  const wallet = state?.wallet || state?.address || state?.rawAddress || '';
  const isConnected = !!wallet && !!state?.isConnected;

  const [loading, setLoading] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function check() {
      if (!isConnected) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const status = await getSubscriptionStatus();
        const tier = (status?.tier || 'Free').toString().toLowerCase();

        // For now we just need a valid response; any tier is "allowed"
        if (!cancelled) {
          setAllowed(true);
        }

        console.debug('[PaymentGuard] subscription status', { tier, status });
      } catch (e) {
        if (cancelled) return;
        console.error('[PaymentGuard] status check failed', e);
        setError(
          typeof e?.message === 'string'
            ? e.message
            : 'Unable to check subscription status.'
        );
        setAllowed(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    check();

    return () => {
      cancelled = true;
    };
  }, [isConnected, wallet]);

  if (loading) {
    return loadingFallback || null;
  }

  if (!isConnected) {
    return (
      <p className="muted">
        Connect your wallet first to use subscription features.
      </p>
    );
  }

  if (!allowed) {
    return (
      <div className="subscription-alert error">
        {error || 'Subscription status unavailable right now.'}
      </div>
    );
  }

  return <>{children}</>;
}
