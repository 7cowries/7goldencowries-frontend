/**
 * @jest-environment jsdom
 */

describe('api utilities', () => {
  afterEach(() => {
    delete global.fetch;
    delete process.env.REACT_APP_API_URL;
    jest.resetModules();
  });

  test('respects absolute REACT_APP_API_URL values', async () => {
    jest.resetModules();
    process.env.REACT_APP_API_URL = 'https://api.example.com/v1';
    const responsePayload = { ok: true };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(responsePayload),
      })
    );
    const { getJSON } = require('./api');
    const data = await getJSON('/users/me');
    expect(data).toEqual(responsePayload);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/v1/users/me',
      expect.objectContaining({ credentials: 'include' })
    );
  });

  test('dedupes concurrent requests without signals', async () => {
    jest.resetModules();
    process.env.REACT_APP_API_URL = '';
    const resolvers = [];
    global.fetch = jest.fn(
      () =>
        new Promise((resolve) => {
          resolvers.push(resolve);
        })
    );
    const { getJSON } = require('./api');
    const first = getJSON('/api/users/me');
    const second = getJSON('/api/users/me');
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const firstResolver = resolvers.shift();
    firstResolver({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ user: { wallet: 'EQTest' } }),
    });

    const [a, b] = await Promise.all([first, second]);
    expect(a).toEqual(b);

    const third = getJSON('/api/users/me');
    const secondResolver = resolvers.shift();
    secondResolver({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ user: { wallet: 'EQTest' } }),
    });

    await third;
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test('disables dedupe when a signal is provided', async () => {
    jest.resetModules();
    process.env.REACT_APP_API_URL = '';
    const fetchResponse = {
      ok: true,
      status: 200,
      json: () => Promise.resolve({ ok: true }),
    };
    global.fetch = jest.fn(() => Promise.resolve(fetchResponse));
    const { getJSON } = require('./api');

    const controllerA = new AbortController();
    const controllerB = new AbortController();

    await Promise.all([
      getJSON('/api/test', { signal: controllerA.signal }),
      getJSON('/api/test', { signal: controllerB.signal }),
    ]);

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
