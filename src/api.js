function normalizeBase(raw) {
  const value = typeof raw === 'string' ? raw.trim() : '';
  if (!value) return '';
  const stripTrailing = (input) => (input.endsWith('/') ? input.replace(/\/+$/, '') : input);
  if (/^https?:\/\//i.test(value)) {
    return stripTrailing(value);
  }
  if (value.startsWith('/')) {
    return stripTrailing(value);
  }
  return stripTrailing(`/${value}`);
}

const API_URL = normalizeBase(process.env.REACT_APP_API_URL);

function resolveUrl(endpoint) {
  if (!endpoint) return endpoint;
  if (/^https?:\/\//i.test(endpoint)) return endpoint;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (!API_URL) return path;
  if (/^https?:\/\//i.test(API_URL)) {
    return `${API_URL}${path}`;
  }
  if (API_URL.startsWith('/')) {
    return `${API_URL}${path}`;
  }
  return `${API_URL}/${path.replace(/^\/+/, '')}`;
}

export async function apiGet(endpoint) {
  let res;
  try {
    res = await fetch(resolveUrl(endpoint), {
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
    res = await fetch(resolveUrl(endpoint), {
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
