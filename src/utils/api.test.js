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

  test("reads the API base from env vars and trims trailing slashes", async () => {
    jest.resetModules();
    process.env.REACT_APP_API_BASE = "https://example.com/base///";
    const api = require("./api");
    expect(api.API_BASE).toBe("https://example.com/base");
  });

  test("getJSON joins API_BASE, forwards signal, and includes credentials", async () => {
    jest.resetModules();
    process.env.REACT_APP_API_BASE = "https://api.example.com";
    const response = {
      ok: true,
      status: 200,
      json: jest.fn(() => Promise.resolve({ ok: true })),
    };
    const fetchMock = jest.fn(() => Promise.resolve(response));
    global.fetch = fetchMock;
    const api = require("./api");
    const controller = new AbortController();

    await api.getJSON("/api/health", { signal: controller.signal });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/api/health",
      expect.objectContaining({
        credentials: "include",
        signal: controller.signal,
      })
    );
  });

  test("postJSON throws on non-ok responses", async () => {
    jest.resetModules();
    process.env.NEXT_PUBLIC_API_BASE = "";
    const response = { ok: false, status: 500, json: jest.fn() };
    global.fetch = jest.fn(() => Promise.resolve(response));
    const api = require("./api");

    await expect(api.postJSON("/api/test", { a: 1 })).rejects.toThrow("POST /api/test 500");
  });
});
