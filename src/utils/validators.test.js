const { parseTweetId, isValidTweetUrl } = require('./validators');

describe('tweet url helpers', () => {
  test('parseTweetId extracts id from x.com links', () => {
    const id = parseTweetId('https://x.com/user/status/1234567890');
    expect(id).toBe('1234567890');
  });

  test('isValidTweetUrl detects invalid urls', () => {
    expect(isValidTweetUrl('https://example.com')).toBe(false);
    expect(isValidTweetUrl('https://twitter.com/user/status/1')).toBe(true);
  });
});
