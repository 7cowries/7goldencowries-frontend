export function normalizeTweetUrl(url) {
  if (typeof url !== 'string') return null;
  let u;
  try {
    u = new URL(url.trim());
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, '');
  if (host !== 'x.com' && host !== 'twitter.com' && host !== 'mobile.twitter.com') return null;
  const match = u.pathname.match(/^\/(.+?)\/status\/(\d+)/);
  if (!match) return null;
  const normalized = `https://x.com/${match[1]}/status/${match[2]}`;
  return normalized.length <= 500 ? normalized : null;
}

export function isProofRequired(quest) {
  return !!quest && typeof quest.requirement === 'string' && quest.requirement !== 'none' && quest.requirement.startsWith('x_');
}

export default { normalizeTweetUrl, isProofRequired };
