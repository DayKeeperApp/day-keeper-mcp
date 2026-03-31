import { mock } from "bun:test";
import type { GraphQLClient } from "../../src/client/graphql.js";
import type { HttpClient } from "../../src/client/http.js";

// biome-ignore lint/suspicious/noExplicitAny: test mocks need flexible types
type MockFn = ReturnType<typeof mock<(...args: any[]) => any>>;

export interface MockHttpClient extends HttpClient {
  fetch: MockFn;
  post: MockFn;
  get: MockFn;
}

export interface MockGraphQLClient extends GraphQLClient {
  query: MockFn;
  mutate: MockFn;
}

export function createMockHttpClient(): MockHttpClient {
  return {
    fetch: mock(() => Promise.resolve(new Response("{}", { status: 200 }))),
    post: mock(() => Promise.resolve({})),
    get: mock(() => Promise.resolve({})),
  } as MockHttpClient;
}

export function createMockGraphQLClient(): MockGraphQLClient {
  return {
    query: mock(() => Promise.resolve({})),
    mutate: mock(() => Promise.resolve({})),
  } as MockGraphQLClient;
}
