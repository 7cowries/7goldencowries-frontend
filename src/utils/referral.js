export function captureReferralFromQuery() {
  try {
    const qs = new URLSearchParams(window.location.search);
    const code = qs.get('ref');
    if (code && /^[A-Z0-9_-]{4,64}$/i.test(code)) {
      localStorage.setItem('referral', code);
      window.history.replaceState({}, '', window.location.pathname);
    }
  } catch {}
}
