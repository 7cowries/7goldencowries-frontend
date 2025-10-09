// src/utils/bind-guard.js
// Simple guard to ensure only one in-flight bind-wallet request at a time.
// Returns a promise resolving to the JSON response (or rejecting on network error).
let __bindInFlight = null;

export function guardedBind(wallet, opts = {}) {
  // If a bind is already in progress, return the same promise (prevents spamming the endpoint).
  if (__bindInFlight) {
    // console.info('[guardedBind] returning existing in-flight bind promise');
    return __bindInFlight;
  }

  // Build a minimal POST fetch (mirrors postJSON behavior; adapt headers if your postJSON adds extras)
  __bindInFlight = fetch('/api/session/bind-wallet', {
    method: 'POST',
    headers: Object.assign({ 'Content-Type': 'application/json' }, (opts.headers || {})),
    body: JSON.stringify({ wallet }),
    // include credentials if your app relies on cookies/sessions
    credentials: opts.credentials || 'include',
  }).then(async (res) => {
    if (!res.ok) {
      const text = await res.text().catch(()=>null);
      const err = new Error('Bind wallet request failed: ' + res.status + ' ' + res.statusText + (text ? ' - ' + text : ''));
      err.status = res.status;
      throw err;
    }
    // attempt to parse JSON; if not JSON, return raw text
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) return res.json();
    return res.text();
  }).catch((err) => {
    // bubble up error
    throw err;
  }).finally(() => {
    // clear the in-flight marker so subsequent binds can run
    __bindInFlight = null;
  });

  return __bindInFlight;
}
