export async function setSession(wallet: string) {
  if (!wallet) return;
  try {
    await fetch('/api/session', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ wallet })
    });
  } catch {}
}

export async function clearSession() {
  try {
    await fetch('/api/session', { method: 'DELETE', credentials: 'include' });
  } catch {}
}
