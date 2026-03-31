import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { createHttpClient } from "../../src/client/http.js";
import type { Config } from "../../src/config.js";
import { DayKeeperApiError } from "../../src/shared/errors.js";

const mockConfig: Config = {
  DAY_KEEPER_API_URL: "https://api.example.com",
  DAY_KEEPER_TENANT_ID: "00000000-0000-0000-0000-000000000001",
  DAY_KEEPER_API_KEY: "test-api-key",
  MCP_TRANSPORT: "stdio",
  MCP_HTTP_PORT: 3001,
  DAY_KEEPER_DEFAULT_TIMEZONE: "UTC",
  LOG_LEVEL: "info",
};

describe("HttpClient", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  function setMockFetch(fn: () => Promise<Response>) {
    const mockFn = mock(fn);
    globalThis.fetch = mockFn as unknown as typeof fetch;
    return mockFn;
  }

  test("injects auth headers on every request", async () => {
    const mockFetch = setMockFetch(() =>
      Promise.resolve(new Response('{"ok":true}', { status: 200 })),
    );

    const client = createHttpClient(mockConfig);
    await client.get("/test");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.example.com/test");
    const headers = init.headers as Record<string, string>;
    expect(headers["X-Tenant-Id"]).toBe("00000000-0000-0000-0000-000000000001");
    expect(headers.Authorization).toBe("Bearer test-api-key");
    expect(headers["Content-Type"]).toBe("application/json");
  });

  test("returns response for successful requests", async () => {
    setMockFetch(() => Promise.resolve(new Response('{"data":"hello"}', { status: 200 })));

    const client = createHttpClient(mockConfig);
    const result = await client.get<{ data: string }>("/test");
    expect(result.data).toBe("hello");
  });

  test("throws DayKeeperApiError on non-retryable response", async () => {
    setMockFetch(() =>
      Promise.resolve(new Response("Not Found", { status: 404, statusText: "Not Found" })),
    );

    const client = createHttpClient(mockConfig);
    try {
      await client.get("/missing");
      throw new Error("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(DayKeeperApiError);
      const apiError = error as DayKeeperApiError;
      expect(apiError.statusCode).toBe(404);
      expect(apiError.message).toContain("404");
    }
  });

  test("retries on 429 and succeeds on second attempt", async () => {
    let attempt = 0;
    setMockFetch(() => {
      attempt++;
      if (attempt === 1) {
        return Promise.resolve(new Response("Too Many Requests", { status: 429 }));
      }
      return Promise.resolve(new Response('{"ok":true}', { status: 200 }));
    });

    const client = createHttpClient(mockConfig);
    const result = await client.get<{ ok: boolean }>("/rate-limited");
    expect(result.ok).toBe(true);
    expect(attempt).toBe(2);
  });

  test("retries on 503 and succeeds on third attempt", async () => {
    let attempt = 0;
    setMockFetch(() => {
      attempt++;
      if (attempt <= 2) {
        return Promise.resolve(
          new Response("Service Unavailable", {
            status: 503,
            statusText: "Service Unavailable",
          }),
        );
      }
      return Promise.resolve(new Response('{"ok":true}', { status: 200 }));
    });

    const client = createHttpClient(mockConfig);
    const result = await client.get<{ ok: boolean }>("/unavailable");
    expect(result.ok).toBe(true);
    expect(attempt).toBe(3);
  });

  test("throws after max retries exhausted on 503", async () => {
    setMockFetch(() =>
      Promise.resolve(
        new Response("Service Unavailable", {
          status: 503,
          statusText: "Service Unavailable",
        }),
      ),
    );

    const client = createHttpClient(mockConfig);
    try {
      await client.get("/always-down");
      throw new Error("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(DayKeeperApiError);
      const apiError = error as DayKeeperApiError;
      expect(apiError.statusCode).toBe(503);
    }
  });

  test("does not retry on 400 Bad Request", async () => {
    let callCount = 0;
    setMockFetch(() => {
      callCount++;
      return Promise.resolve(
        new Response("Bad Request", { status: 400, statusText: "Bad Request" }),
      );
    });

    const client = createHttpClient(mockConfig);
    try {
      await client.get("/bad");
      throw new Error("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(DayKeeperApiError);
      expect(callCount).toBe(1);
    }
  });

  test("sends POST body as JSON", async () => {
    const mockFetch = setMockFetch(() =>
      Promise.resolve(new Response('{"created":true}', { status: 200 })),
    );

    const client = createHttpClient(mockConfig);
    await client.post("/items", { name: "test" });

    const [, init] = mockFetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.method).toBe("POST");
    expect(init.body).toBe('{"name":"test"}');
  });

  test("retries on network errors", async () => {
    let attempt = 0;
    setMockFetch(() => {
      attempt++;
      if (attempt === 1) {
        return Promise.reject(new TypeError("fetch failed"));
      }
      return Promise.resolve(new Response('{"ok":true}', { status: 200 }));
    });

    const client = createHttpClient(mockConfig);
    const result = await client.get<{ ok: boolean }>("/flaky");
    expect(result.ok).toBe(true);
    expect(attempt).toBe(2);
  });
});
