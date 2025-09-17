/**
 * @jest-environment jsdom
 */

function createResponse({ ok = true, status = 200, jsonData = {}, textData = '' } = {}) {
  const response = {
    ok,
    status,
    headers: { get: () => null },
    json: jest.fn(() =>
      jsonData instanceof Error ? Promise.reject(jsonData) : Promise.resolve(jsonData)
    ),
    text: jest.fn(() => Promise.resolve(textData)),
  };
  response.clone = () =>
    createResponse({ ok, status, jsonData, textData });
  return response;
}

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

  test('wraps HTTP errors with ApiError and normalized payload', async () => {
    jest.resetModules();
    process.env.REACT_APP_API_URL = '';
    const payload = { error: 'PAYMENT_REQUIRED', message: 'Active subscription required' };
    global.fetch = jest.fn(() =>
      Promise.resolve(createResponse({ ok: false, status: 402, jsonData: payload }))
    );
    const { getJSON, ApiError } = require('./api');

    let caught;
    try {
      await getJSON('/api/v1/subscription/claim');
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(ApiError);
    expect(caught).toMatchObject({
      code: 'payment-required',
      error: 'payment-required',
      message: 'Active subscription required',
      status: 402,
    });
    expect(caught.details).toMatchObject({
      error: 'payment-required',
      message: 'Active subscription required',
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('wraps network errors with ApiError', async () => {
    jest.resetModules();
    process.env.REACT_APP_API_URL = '';
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    const { getJSON, ApiError } = require('./api');

    let caught;
    try {
      await getJSON('/api/test');
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(ApiError);
    expect(caught).toMatchObject({
      message: 'Network error: Failed to fetch',
      code: 'network-error',
      error: 'network-error',
    });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test('cleans up dedupe entries after failures', async () => {
    jest.resetModules();
    process.env.REACT_APP_API_URL = '';
    global.fetch = jest
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(createResponse({ jsonData: { ok: true } }));
    const { getJSON } = require('./api');

    await expect(getJSON('/api/test')).rejects.toMatchObject({
      message: 'Network error: Failed to fetch',
    });

    const data = await getJSON('/api/test');
    expect(data).toEqual({ ok: true });
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });
});
