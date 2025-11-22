/**
 * @jest-environment jsdom
 */

describe("api utils", () => {
  const originalEnv = process.env.REACT_APP_API_BASE;
  const originalNextEnv = process.env.NEXT_PUBLIC_API_BASE;
  const originalFetch = global.fetch;

  afterEach(() => {
    process.env.REACT_APP_API_BASE = originalEnv;
    process.env.NEXT_PUBLIC_API_BASE = originalNextEnv;
    global.fetch = originalFetch;
    jest.resetModules();
  });

  test("falls back to same-origin when API base is blank", async () => {
    process.env.REACT_APP_API_BASE = "";
    const response = {
      ok: true,
      status: 200,
      json: jest.fn(() => Promise.resolve({ ok: true })),
    };
    const fetchMock = jest.fn(() => Promise.resolve(response));
    global.fetch = fetchMock;

    const api = require("./api");
    await api.getJSON("/api/quests");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/quests",
      expect.objectContaining({ credentials: "include" })
    );
    expect(api.API_BASE).toBe("");
  });

  test("normalizes absolute API base URLs and strips trailing slashes", async () => {
    process.env.REACT_APP_API_BASE = "https://example.com/base///";
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

  test("passes through AbortController signals", async () => {
    process.env.REACT_APP_API_BASE = "";
    const payload = { ok: true };
    const response = {
      ok: true,
      status: 200,
      json: jest.fn(() => Promise.resolve(payload)),
    };
    const fetchMock = jest.fn(() => Promise.resolve(response));
    global.fetch = fetchMock;

    const api = require("./api");
    const controller = new AbortController();
    await api.getLeaderboard({ signal: controller.signal });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/leaderboard",
      expect.objectContaining({ signal: controller.signal })
    );
  });
});
