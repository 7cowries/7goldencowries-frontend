/**
 * @jest-environment jsdom
 */

describe("api utils", () => {
  const originalEnv = process.env.REACT_APP_API_URL;
  const originalFetch = global.fetch;

  afterEach(() => {
    process.env.REACT_APP_API_URL = originalEnv;
    global.fetch = originalFetch;
    jest.resetModules();
  });

  test("uses same-origin /api when API base is blank", async () => {
    jest.resetModules();
    process.env.REACT_APP_API_URL = "";
    const response = {
      ok: true,
      status: 200,
      json: jest.fn(() => Promise.resolve({ ok: true })),
    };
    const fetchMock = jest.fn(() => Promise.resolve(response));
    global.fetch = fetchMock;
    const api = require("./api");

    await api.getJSON("quests");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/quests",
      expect.objectContaining({ credentials: "include" })
    );
    expect(api.API_BASE).toBe("");
  });

  test("normalizes absolute API base URLs and strips trailing slashes", async () => {
    jest.resetModules();
    process.env.REACT_APP_API_URL = "https://example.com/base///";
    const response = {
      ok: true,
      status: 200,
      json: jest.fn(() => Promise.resolve({ ok: true })),
    };
    const fetchMock = jest.fn(() => Promise.resolve(response));
    global.fetch = fetchMock;
    const api = require("./api");

    await api.getJSON("/api/status");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/base/api/status",
      expect.any(Object)
    );
    expect(api.API_BASE).toBe("https://example.com/base");
  });

  test("de-dupes concurrent requests when no abort signal is provided", async () => {
    jest.resetModules();
    process.env.REACT_APP_API_URL = "";
    const payload = { ok: true };
    const response = {
      ok: true,
      status: 200,
      json: jest.fn(() => Promise.resolve(payload)),
    };
    const fetchMock = jest.fn(() => Promise.resolve(response));
    global.fetch = fetchMock;
    const api = require("./api");

    const [first, second] = await Promise.all([
      api.getJSON("/api/me"),
      api.getJSON("/api/me"),
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(first).toEqual(payload);
    expect(second).toEqual(payload);
  });

  test("does not de-dupe when each request has its own abort signal", async () => {
    jest.resetModules();
    process.env.REACT_APP_API_URL = "";
    const response = {
      ok: true,
      status: 200,
      json: jest.fn(() => Promise.resolve({ ok: true })),
    };
    const fetchMock = jest.fn(() => Promise.resolve(response));
    global.fetch = fetchMock;
    const api = require("./api");

    const controllerA = new AbortController();
    const controllerB = new AbortController();
    await Promise.all([
      api.getJSON("/api/me", { signal: controllerA.signal }),
      api.getJSON("/api/me", { signal: controllerB.signal }),
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
