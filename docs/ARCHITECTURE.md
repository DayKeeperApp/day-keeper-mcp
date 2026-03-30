# Architecture

## Overview

```
┌─────────────────┐     ┌───────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   MCP Host       │     │   Transport   │     │   MCP Server     │     │  Day Keeper API  │
│ (Claude Code,    │◄───►│  stdio (default)│◄───►│  Tools (actions) │────►│  GraphQL /graphql│
│  Claude Desktop, │     │  or HTTP      │     │  Resources (data)│────►│  REST /api/v1/   │
│  Cursor, etc.)   │     │               │     │  Prompts (flows) │     │    sync, attach  │
└─────────────────┘     └───────────────┘     └──────────────────┘     └──────────────────┘
```

The day-keeper-mcp server sits between an MCP host (like Claude Code) and the Day Keeper API, translating AI assistant interactions into API calls and formatting responses for LLM consumption.

## Design Philosophy

This is a **learning-focused** MCP server that showcases the breadth of the MCP protocol:

- **Tools** — Actions the LLM can take: CRUD operations, queries, commands
- **Resources** — Read-only data the client can surface: entity listings, schema reference
- **Prompts** — Reusable interaction templates: daily planning, meeting prep, contact lookup

The design prioritizes **breadth of MCP features** over production hardening.

## Day Keeper API Mapping

### GraphQL (`/graphql`)

All CRUD operations go through the Hot Chocolate GraphQL API:

- **Queries**: Connection types with cursor pagination (first/after/last/before), filter inputs, sort inputs
- **Mutations**: Typed input/payload pairs with error unions (e.g., `CreateCalendarEventInput` → `CreateCalendarEventPayload`)
- **Special queries**: `eventsForRange` (recurrence expansion), `recurringOccurrences` (task recurrence)

### REST

Two REST endpoints serve specific purposes:

| Endpoint | Purpose |
|----------|---------|
| `POST /api/v1/sync/pull` | Pull changes since a cursor (monotonic ChangeLog) |
| `POST /api/v1/sync/push` | Push local changes with conflict detection |
| `POST /api/v1/attachments` | Upload files (multipart) |
| `GET /api/v1/attachments/{id}` | Download files |
| `GET /api/v1/attachments/{id}/metadata` | Get attachment metadata |
| `DELETE /api/v1/attachments/{id}` | Delete attachments |

## Entity Grouping

The Day Keeper API has 22 entity types, grouped by domain for MCP tool organization:

| Domain | Entities | MCP File |
|--------|----------|----------|
| **Core** | Tenant, User, Space, SpaceMembership | `src/tools/spaces.ts` |
| **Calendar** | Calendar, CalendarEvent, EventReminder, RecurrenceException, EventType | `src/tools/calendar.ts` |
| **Tasks** | Project, TaskItem, TaskCategory, Category | `src/tools/tasks.ts` |
| **People** | Person, ContactMethod, Address, ImportantDate | `src/tools/people.ts` |
| **Shopping** | ShoppingList, ListItem | `src/tools/shopping.ts` |
| **Sync** | (ChangeLog protocol) | `src/tools/sync.ts` |
| **Attachments** | Attachment | (via REST client) |
| **Devices** | Device, DeviceNotificationPreference | (lower priority) |

## Tool Design

### Principles

1. **Domain-oriented grouping** — Tools are grouped by domain (calendar, tasks, people, etc.), not by entity
2. **Separate tools per action** — `task-create`, `task-update`, `task-complete` are separate tools (not a single mega-tool with an `action` parameter)
3. **Zod input schemas** — Every tool validates input with Zod, which the SDK converts to JSON Schema for the LLM
4. **LLM-friendly responses** — Tools return formatted text, not raw JSON. A `formatEvent()` function produces human-readable output.
5. **Error as content** — Failed operations return `{ isError: true }` with actionable error messages

### Tool Count

~30 tools across 6 domain files. This balances discoverability (LLMs can reason about 30 tools) with coverage (all major CRUD operations exposed).

## Resource Design

### Static Listings

Resources with fixed URIs that return collection data:

```
daykeeper://spaces       → All spaces with basic info
daykeeper://calendars    → All calendars across spaces
daykeeper://projects     → All projects across spaces
daykeeper://categories   → All task categories
daykeeper://event-types  → All event types
```

### Dynamic Templates

`ResourceTemplate` URIs with variables for entity detail views:

```
daykeeper://space/{spaceId}           → Space with membership list
daykeeper://calendar/{calendarId}     → Calendar with event summary
daykeeper://event/{eventId}           → Full event with reminders/exceptions
daykeeper://task/{taskId}             → Task with categories
daykeeper://person/{personId}         → Person with contacts/addresses/dates
daykeeper://shopping-list/{listId}    → List with all items
```

### Schema Reference

```
daykeeper://schema/entities → All 22 entity types with descriptions and relationships
```

This resource gives LLMs the context to understand the Day Keeper data model.

## Prompt Design

Prompts fetch **live data** from the Day Keeper API, then construct structured messages for the LLM. This is what makes them more powerful than static templates:

```
User selects "daily-planning" prompt
  → Server calls eventsForRange(today) + taskItems(status: open)
  → Constructs message: "Here is your schedule and open tasks for today: ..."
  → LLM receives pre-loaded context and planning instructions
```

## API Client Architecture

```
src/client/
├── http.ts          # Shared: base URL, auth headers, timeout, retry
├── graphql.ts       # GraphQL: query(), mutate(), error extraction
├── sync.ts          # REST: pull(), push()
└── attachments.ts   # REST: upload(), getMetadata(), delete()
```

### Shared HTTP Client (`http.ts`)

- Injects `X-Tenant-Id` and `Authorization: Bearer` headers on every request
- 15-second timeout
- Retry for transient errors (429, 502, 503, 504): 2 retries, exponential backoff (500ms, 1500ms)
- Throws `DayKeeperApiError` with status code and details

### GraphQL Client (`graphql.ts`)

- `query(document, variables)` — Execute a GraphQL query
- `mutate(document, variables)` — Execute a GraphQL mutation
- Extracts GraphQL-level errors from the `errors` field in responses
- Handles Hot Chocolate error types: `InputValidationError`, `EntityNotFoundError`, `BusinessRuleViolationError`

### Why No Codegen?

The Day Keeper GraphQL schema is stable and under our control. Hand-written queries with Zod runtime validation provide:
- No build step / codegen dependency
- Queries visible and editable in source
- Zod catches runtime type mismatches at the API boundary

See [ADR-0003](adr/0003-api-client-approach.md).

## Error Handling

### Layers

1. **HTTP client** — Catches network errors, timeouts, non-2xx responses → throws `DayKeeperApiError`
2. **GraphQL client** — Parses GraphQL error arrays → throws typed errors
3. **Tool handlers** — Catches all errors → returns `{ content: [...], isError: true }` with LLM-friendly message
4. **MCP SDK** — Final safety net, catches unhandled errors

### LLM-Friendly Error Messages

```
"Could not find calendar event with ID abc-123. The event may have been deleted."
"Failed to create task: Title is required and must be between 1 and 512 characters."
"The Day Keeper API is temporarily unavailable (HTTP 503). Please try again."
```

### Startup Health Check

On server startup, the client makes a lightweight `GET /health/ready` call. If it fails, the server still starts (tools will return individual errors) but logs a warning.

## Transport Strategy

| Transport | Use Case | Config |
|-----------|----------|--------|
| **stdio** (default) | Claude Code, Claude Desktop, Cursor | `MCP_TRANSPORT=stdio` |
| **Streamable HTTP** | Remote access, multi-client | `MCP_TRANSPORT=http`, `MCP_HTTP_PORT=3001` |

stdio is the default because most MCP hosts spawn the server as a subprocess. HTTP transport is opt-in for development/testing and potential remote access.

See [ADR-0002](adr/0002-transport-strategy.md).

## Testing Strategy

All tests use `bun:test`.

| Layer | Approach |
|-------|----------|
| **Tool handlers** | Mock API client, test input validation + response formatting |
| **API clients** | Mock `fetch`, test query construction + error handling + retry |
| **Resources** | Mock API client, test URI routing + data formatting |
| **Prompts** | Mock API client, test message construction |
| **Integration** | `InMemoryTransport.createLinkedPair()` for full E2E |

The `InMemoryTransport` approach from the MCP SDK enables testing the complete server without stdio or HTTP, including tool listing, tool calling, resource reading, and prompt retrieval.

See [ADR-0005](adr/0005-testing-strategy.md).
