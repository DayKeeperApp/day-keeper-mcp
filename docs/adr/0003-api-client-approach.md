# ADR-0003: API Client Approach

**Status**: Accepted
**Date**: 2026-03-29

## Context

The MCP server needs to communicate with the Day Keeper API, which exposes:

- **GraphQL** (`/graphql`): Hot Chocolate with cursor pagination, filter inputs, sort inputs, typed error unions
- **REST** (`/api/v1/sync/*`, `/api/v1/attachments/*`): Standard REST with JSON request/response

For the GraphQL client, several approaches exist:
1. **Code generation** (graphql-codegen) — Generate typed client from the schema
2. **Generic GraphQL client** (graphql-request, urql) — Library with query execution
3. **Direct HTTP** — Use `fetch` with hand-written query strings

## Decision

Use **direct HTTP via `fetch`** (Bun-native) with **hand-written GraphQL query strings** and **Zod schemas** for runtime response validation.

The client architecture:
- `src/client/http.ts` — Shared HTTP client with auth headers, retry, timeout
- `src/client/graphql.ts` — GraphQL query/mutate methods using the shared HTTP client
- `src/client/sync.ts` — REST sync client
- `src/client/attachments.ts` — REST attachment client

## Alternatives Considered

### GraphQL Code Generation (graphql-codegen)

**Pros**: Fully typed queries and responses at compile time, auto-generated from schema.

**Cons**: Requires a build step, adds codegen dependency chain, generated code is opaque, schema must be accessible at build time. Overkill for ~30 queries against a stable schema we control.

### GraphQL Client Library (graphql-request)

**Pros**: Handles query execution, error parsing, and some typing.

**Cons**: Additional dependency for minimal benefit over `fetch`. We still need to write queries and parse responses. The library doesn't understand Hot Chocolate's specific error union pattern.

### Direct HTTP with Zod (chosen)

**Pros**: No dependencies beyond `fetch` (Bun-native) and Zod. Queries are visible and editable in source. Zod catches runtime type mismatches at the API boundary. Full understanding of what's happening.

**Cons**: Manual query maintenance. No compile-time type safety for query shapes (Zod provides runtime safety instead). Need to handle GraphQL response parsing ourselves.

## Consequences

- **Positive**: No build step, no codegen dependency. The project stays simple.
- **Positive**: Queries are readable in source — good for a learning project.
- **Positive**: Zod schemas serve double duty: validating API responses AND defining MCP tool input schemas.
- **Positive**: Full control over error handling, especially for Hot Chocolate's typed error unions.
- **Negative**: If the Day Keeper schema changes significantly, queries need manual updates. Acceptable because the schema is stable and under our control.
- **Negative**: No compile-time guarantee that query field selections match the schema. Mitigated by Zod runtime validation and unit tests with fixture data.
