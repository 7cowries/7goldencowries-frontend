import { normalizeTweetUrl, isProofRequired } from './proof';

describe('normalizeTweetUrl', () => {
  it('normalizes x.com URLs', () => {
    expect(normalizeTweetUrl('https://x.com/user/status/12345')).toBe('https://x.com/user/status/12345');
    expect(normalizeTweetUrl('https://x.com/user/status/12345?ref=abc')).toBe('https://x.com/user/status/12345');
  });
  it('normalizes twitter.com URLs', () => {
    expect(normalizeTweetUrl('https://twitter.com/user/status/999')).toBe('https://x.com/user/status/999');
    expect(normalizeTweetUrl('https://mobile.twitter.com/user/status/1')).toBe('https://x.com/user/status/1');
  });
  it('rejects invalid URLs', () => {
    expect(normalizeTweetUrl('https://example.com/user/status/1')).toBeNull();
    expect(normalizeTweetUrl('https://twitter.com/user/123')).toBeNull();
    expect(normalizeTweetUrl('not a url')).toBeNull();
  });
});

describe('isProofRequired', () => {
  it('detects x_ requirement', () => {
    expect(isProofRequired({ requirement: 'x_tweet' })).toBe(true);
    expect(isProofRequired({ requirement: 'x_quote' })).toBe(true);
    expect(isProofRequired({ requirement: 'none' })).toBe(false);
    expect(isProofRequired({ requirement: 'other' })).toBe(false);
  });
});
