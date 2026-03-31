import type { Config } from "../config.js";
import { DayKeeperApiError } from "../shared/errors.js";

export interface HttpClient {
  fetch(path: string, init?: RequestInit): Promise<Response>;
  post<T>(path: string, body: unknown): Promise<T>;
  get<T>(path: string): Promise<T>;
}

const RETRYABLE_STATUS_CODES = new Set([429, 502, 503, 504]);
const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2;
const BASE_BACKOFF_MS = 500;

export function createHttpClient(config: Config): HttpClient {
  const {
    DAY_KEEPER_API_URL: baseUrl,
    DAY_KEEPER_TENANT_ID: tenantId,
    DAY_KEEPER_API_KEY: apiKey,
  } = config;

  async function httpFetch(path: string, init?: RequestInit): Promise<Response> {
    const url = `${baseUrl}${path}`;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

      try {
        const response = await fetch(url, {
          ...init,
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            "X-Tenant-Id": tenantId,
            Authorization: `Bearer ${apiKey}`,
            ...(init?.headers as Record<string, string>),
          },
        });

        if (response.ok) {
          return response;
        }

        if (RETRYABLE_STATUS_CODES.has(response.status) && attempt < MAX_RETRIES) {
          const backoffMs = BASE_BACKOFF_MS * 3 ** attempt;
          await Bun.sleep(backoffMs);
          continue;
        }

        const body = await response.text().catch(() => "");
        throw new DayKeeperApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          body,
        );
      } catch (error) {
        if (error instanceof DayKeeperApiError) throw error;
        if (error instanceof DOMException && error.name === "AbortError") {
          throw new DayKeeperApiError("Request timed out", 408);
        }
        if (attempt < MAX_RETRIES) {
          const backoffMs = BASE_BACKOFF_MS * 3 ** attempt;
          await Bun.sleep(backoffMs);
          continue;
        }
        throw new DayKeeperApiError(
          error instanceof Error ? error.message : "Network error",
          0,
          error,
        );
      } finally {
        clearTimeout(timeoutId);
      }
    }

    throw new DayKeeperApiError("Max retries exceeded", 0);
  }

  async function post<T>(path: string, body: unknown): Promise<T> {
    const response = await httpFetch(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return response.json() as Promise<T>;
  }

  async function get<T>(path: string): Promise<T> {
    const response = await httpFetch(path, { method: "GET" });
    return response.json() as Promise<T>;
  }

  return { fetch: httpFetch, post, get };
}
