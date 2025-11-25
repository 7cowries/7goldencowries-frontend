export function parseTweetId(url) {
  const match = /^https?:\/\/(twitter\.com|x\.com)\/[^/]+\/status\/(\d+)/i.exec(url || '');
  return match ? match[2] : null;
}

export function isValidTweetUrl(url) {
  return !!parseTweetId(url);
}
