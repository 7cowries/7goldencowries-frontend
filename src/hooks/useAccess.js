import { useEffect, useMemo, useState } from 'react';
import { getMe } from '../utils/api';

function inferAdmin(me) {
  if (!me || typeof me !== 'object') return false;
  const flags = [
    me.isAdmin,
    me.admin,
    me.is_admin,
    me.isOperator,
    me.is_operator,
    me.roles,
    me.permissions,
    me.profile?.isAdmin,
    me.profile?.is_admin,
    me.profile?.roles,
  ];

  for (const entry of flags) {
    if (entry === true) return true;
    if (typeof entry === 'string' && /admin|operator|superuser/i.test(entry)) return true;
    if (Array.isArray(entry) && entry.some((v) => /admin|operator|superuser/i.test(String(v)))) {
      return true;
    }
  }

  return false;
}

export default function useAccess() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getMe({ force: true })
      .then((data) => {
        if (!active) return;
        setMe(data || null);
      })
      .catch(() => {
        if (!active) return;
        setMe(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const refresh = () => {
      getMe({ force: true }).then((data) => {
        if (!active) return;
        setMe(data || null);
      }).catch(() => {});
    };

    window.addEventListener('profile-updated', refresh);
    window.addEventListener('wallet:changed', refresh);

    return () => {
      active = false;
      window.removeEventListener('profile-updated', refresh);
      window.removeEventListener('wallet:changed', refresh);
    };
  }, []);

  const isAdmin = useMemo(() => inferAdmin(me), [me]);

  return { me, isAdmin, loading };
}
