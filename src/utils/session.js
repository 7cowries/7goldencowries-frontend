export async function touchSession(addr) {
  try {
    const res = await fetch('/api/auth/wallet/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ address: addr })
    });
    return res.ok;
  } catch {
    return false;
  }
}
