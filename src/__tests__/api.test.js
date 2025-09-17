/**
 * @jest-environment jsdom
 */

describe("api utils", () => {
  const originalEnv = process.env.REACT_APP_API_URL;
  const originalFetch = global.fetch;

  afterEach(() => {
    jest.resetModules();
    process.env.REACT_APP_API_URL = originalEnv;
    global.fetch = originalFetch;
  });

  test("normalizes absolute API base URL", async () => {
    process.env.REACT_APP_API_URL = "https://example.com///";
    jest.resetModules();
    const { API_BASE } = require("../utils/api");
    expect(API_BASE).toBe("https://example.com");
  });

  test("treats blank API base as same-origin", async () => {
    process.env.REACT_APP_API_URL = "  ";
    jest.resetModules();
    const { API_BASE } = require("../utils/api");
    expect(API_BASE).toBe("");
  });

  test("de-dupes concurrent GET requests", async () => {
    const response = { ok: true, status: 200, json: jest.fn(() => Promise.resolve({ ok: true })) };
    const fetchMock = jest.fn(() => Promise.resolve(response));
    global.fetch = fetchMock;
    process.env.REACT_APP_API_URL = "https://api.example";
    jest.resetModules();
    const { getJSON } = require("../utils/api");
    const [a, b] = await Promise.all([getJSON("/foo"), getJSON("/foo")]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(a).toEqual({ ok: true });
    expect(b).toEqual({ ok: true });
    await getJSON("/foo");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("de-dupes concurrent POST requests with identical bodies", async () => {
    const response = { ok: true, status: 200, json: jest.fn(() => Promise.resolve({ ok: true })) };
    const fetchMock = jest.fn(() => Promise.resolve(response));
    global.fetch = fetchMock;
    process.env.REACT_APP_API_URL = "https://api.example";
    jest.resetModules();
    const { postJSON } = require("../utils/api");
    const payload = { hello: "world" };
    const [first, second] = await Promise.all([
      postJSON("/submit", payload),
      postJSON("/submit", payload),
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(first).toEqual({ ok: true });
    expect(second).toEqual({ ok: true });
  });
});
