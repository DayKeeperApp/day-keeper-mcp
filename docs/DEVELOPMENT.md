# Development Guide

## Prerequisites

- [mise](https://mise.jdx.dev/getting-started.html) — manages Bun version and provides task runner
- A running Day Keeper API instance (for manual testing)

## Setup

```bash
# Install Bun via mise
mise install

# Install dependencies
bun install

# Copy environment config
cp .env.example .env
# Edit .env with your Day Keeper API details

# Install git hooks
bunx lefthook install
```

## Running

```bash
# Start MCP server in stdio mode (default)
mise run dev

# Start in HTTP mode (for remote access or testing)
mise run dev-http

# Open MCP Inspector for interactive testing
mise run inspect
```

## mise Tasks

| Task | Command | Description |
|------|---------|-------------|
| `dev` | `mise run dev` | Run server in stdio mode |
| `dev-http` | `mise run dev-http` | Run server in HTTP mode on port 3001 |
| `test` | `mise run test` | Run all tests with bun:test |
| `typecheck` | `mise run typecheck` | Type-check with tsc --noEmit |
| `lint` | `mise run lint` | Check code with Biome |
| `lint-fix` | `mise run lint-fix` | Fix lint issues with Biome |
| `inspect` | `mise run inspect` | Open MCP Inspector |

## Testing

All tests use `bun:test` — no vitest or jest.

```bash
# Run all tests
bun test

# Run specific test file
bun test test/tools/calendar.test.ts

# Run tests matching a pattern
bun test --grep "calendar-list"

# Run with coverage
bun test --coverage
```

### Test Patterns

**Tool handler tests** — Mock the API client, test input validation and response formatting:

```typescript
import { describe, test, expect } from "bun:test";
import { createMockGraphQLClient } from "../helpers/mock-client";

describe("calendar-list", () => {
  test("returns formatted calendars", async () => {
    const client = createMockGraphQLClient();
    client.query.mockResolvedValueOnce({ calendars: { nodes: [...] } });

    const result = await handleCalendarList(client, { spaceId: "..." });
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("My Calendar");
  });
});
```

**Integration tests** — Use `InMemoryTransport` for full E2E:

```typescript
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory";

const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
// Connect server and client, then call tools/resources/prompts
```

### Test Structure

```
test/
├── fixtures/           # JSON response fixtures from the Day Keeper API
├── helpers/
│   └── mock-client.ts  # Mock GraphQL/sync/attachment clients
├── tools/              # Tool handler unit tests
├── resources/          # Resource handler tests
├── prompts/            # Prompt rendering tests
├── client/             # API client tests (HTTP, GraphQL, sync)
└── integration/
    └── server.test.ts  # E2E with InMemoryTransport
```

## Adding a New Tool

1. **Create the handler function** in the appropriate `src/tools/<domain>.ts` file:

```typescript
export async function handleMyTool(
  client: GraphQLClient,
  args: { param1: string; param2?: number }
) {
  try {
    const result = await client.query(MY_QUERY, { ...args });
    return { content: [{ type: "text" as const, text: formatResult(result) }] };
  } catch (error) {
    return {
      content: [{ type: "text" as const, text: formatErrorForLLM(error) }],
      isError: true,
    };
  }
}
```

2. **Register the tool** in the domain file's registration function:

```typescript
server.tool(
  "my-tool",
  "Description of what this tool does",
  { param1: z.string(), param2: z.number().optional() },
  async (args) => handleMyTool(client, args)
);
```

3. **Add a unit test** in `test/tools/<domain>.test.ts`

4. **Update TOOL-CATALOG.md** with the new tool's documentation

## Adding a New Resource

1. **For static resources** — Use `server.resource()`:

```typescript
server.resource(
  "my-resource",
  "daykeeper://my-resource",
  async (uri) => ({
    contents: [{ uri: uri.href, mimeType: "text/plain", text: "..." }],
  })
);
```

2. **For dynamic resources** — Use `ResourceTemplate`:

```typescript
const template = new ResourceTemplate("daykeeper://entity/{id}", { list: undefined });

server.resource(
  "entity-detail",
  template,
  async (uri, { id }) => ({
    contents: [{ uri: uri.href, mimeType: "text/plain", text: "..." }],
  })
);
```

3. **Add a test** and **update RESOURCE-CATALOG.md**

## Adding a New Prompt

1. **Create the prompt handler**:

```typescript
server.prompt(
  "my-prompt",
  "Description of the prompt",
  { arg1: z.string().optional() },
  async (args) => {
    const data = await client.query(SOME_QUERY, args);
    return {
      messages: [
        { role: "user", content: { type: "text", text: `Context: ${formatData(data)}\n\nPlease help me...` } }
      ],
    };
  }
);
```

2. **Add a test** and **update PROMPT-CATALOG.md**

## Code Style

This project uses [Biome](https://biomejs.dev) for linting and formatting.

```bash
# Check for issues
mise run lint

# Auto-fix issues
mise run lint-fix
```

Biome replaces both ESLint and Prettier with a single, fast tool.

## Git Hooks

[lefthook](https://github.com/evilmartians/lefthook) manages git hooks:

**pre-commit** (runs in parallel):
- `lint` — Biome check
- `typecheck` — tsc --noEmit

**pre-push**:
- `test` — bun test

Install hooks after cloning:

```bash
bunx lefthook install
```

## Project Structure

```
src/
├── index.ts          # Entry point: load config, select transport, start server
├── server.ts         # McpServer creation + register all capabilities
├── config.ts         # Zod-validated environment configuration
├── client/           # API client layer (HTTP, GraphQL, sync, attachments)
├── tools/            # MCP tool handlers, grouped by domain
├── resources/        # MCP resource handlers (listings, templates, schema)
├── prompts/          # MCP prompt handlers (planning, shopping, contacts)
└── shared/           # Errors, formatters, pagination helper
```
