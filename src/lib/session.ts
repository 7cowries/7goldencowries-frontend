export async function setSession(wallet: string) {
  try {
    await fetch('/api/session', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({ wallet }),
      credentials: 'include'
    });
  } catch {}
}

export async function clearSession() {
  try {
    await fetch('/api/logout', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      credentials: 'include'
    });
  } catch {}
}
