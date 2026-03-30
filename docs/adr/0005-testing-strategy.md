# ADR-0005: Testing Strategy

**Status**: Accepted
**Date**: 2026-03-29

## Context

The MCP server needs a testing strategy that:
- Works without a live Day Keeper API instance
- Tests tool logic, error handling, and response formatting
- Validates the full MCP protocol flow (client connects, lists tools, calls tools)
- Runs fast in CI
- Uses Bun's built-in test runner (no vitest, jest, or other frameworks)

## Decision

Use **bun:test** with a **layered mock strategy**:

| Test Layer | What's Mocked | What's Tested |
|------------|---------------|---------------|
| **Tool handler unit tests** | API client (GraphQL/sync) | Input validation, response formatting, error handling |
| **API client unit tests** | `globalThis.fetch` | Query construction, header injection, retry logic, error parsing |
| **Resource handler tests** | API client | URI routing, data formatting |
| **Prompt handler tests** | API client | Message construction, data fetching |
| **Integration tests** | API client (optional) | Full MCP protocol via `InMemoryTransport.createLinkedPair()` |

### Key Patterns

**Tool handlers are pure functions** extracted from registration callbacks:

```typescript
// Testable without MCP server
export async function handleCalendarList(client: GraphQLClient, args: { spaceId?: string }) { ... }

// Registration wires handler to server
server.tool("calendar-list", schema, (args) => handleCalendarList(client, args));
```

**InMemoryTransport for E2E** (from the MCP SDK):

```typescript
const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
await server.connect(serverTransport);
await client.connect(clientTransport);
// Now test listTools, callTool, readResource, getPrompt
```

**Fixture-based response data** in `test/fixtures/` — JSON files matching actual Day Keeper API responses.

## Alternatives Considered

### Vitest

Popular test framework with good TypeScript support. However, `bun:test` is built into Bun (zero dependency), has compatible API (describe/test/expect), and runs tests faster. Adding vitest would conflict with the "Bun all-in-one" philosophy.

### Live API integration tests

Testing against a running Day Keeper instance provides the highest confidence but requires infrastructure, is slow, and is flaky. Suitable for CI with a dedicated test environment but not for local development.

**Decision**: Optional gated integration tests that only run when `DAY_KEEPER_API_URL` is set in the test environment. Default tests use mocks only.

### Contract testing (Pact, etc.)

Would verify that our GraphQL queries match the server's schema. Overkill for a project where both sides are under our control. Zod runtime validation catches schema mismatches, and fixture-based tests verify expected response shapes.

## Consequences

- **Positive**: Tests run fast (~seconds) with no infrastructure requirements.
- **Positive**: `InMemoryTransport` tests validate the full MCP protocol stack without stdio/HTTP.
- **Positive**: Mock-based tests make it easy to test error scenarios (API down, 404, validation errors).
- **Positive**: Fixture files serve as documentation of expected API response shapes.
- **Negative**: Mocks can diverge from the real API. Mitigated by Zod validation in production and periodic manual testing with MCP Inspector.
- **Negative**: `InMemoryTransport` tests don't exercise the actual stdio or HTTP transport code paths. Acceptable because transport is a thin layer provided by the SDK.
