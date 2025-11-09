export async function setSession(wallet: string) {
  if (!wallet) return;
  await fetch('/api/session', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ wallet })
  });
}
export async function clearSession() {
  await fetch('/api/session', { method: 'DELETE', credentials: 'include' });
}
