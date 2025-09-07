const API_URL = process.env.REACT_APP_API_URL;

if (!API_URL) {
  throw new Error(
    'REACT_APP_API_URL is required – set it in your environment or .env file'
  );
}

export async function apiGet(endpoint) {
  let res;
  try {
    res = await fetch(`${API_URL}${endpoint}`, {
      credentials: 'include', // important if using cookies/sessions
    });
  } catch (err) {
    const msg = `Network error: ${err.message}`;
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(msg);
    }
    throw new Error(msg);
  }
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      msg += data?.error ? `: ${data.error}` : '';
    } catch (_) {}
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(msg);
    }
    throw new Error(msg);
  }
  return res.json();
}

export async function apiPost(endpoint, body) {
  let res;
  try {
    res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
  } catch (err) {
    const msg = `Network error: ${err.message}`;
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(msg);
    }
    throw new Error(msg);
  }
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      msg += data?.error ? `: ${data.error}` : '';
    } catch (_) {}
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(msg);
    }
    throw new Error(msg);
  }
  return res.json();
}
