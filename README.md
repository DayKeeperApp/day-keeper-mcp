# day-keeper-mcp

An MCP (Model Context Protocol) server that connects AI assistants to the
[Day Keeper](https://github.com/your-org/day-keeper) personal life management API. Built as a
learning project to showcase the full breadth of MCP features — tools, resources, and prompts.

## Features

### Tools (~30 actions)

| Domain       | Tools                                                                                                                                                                                     | Description                                                     |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **Calendar** | `calendar-list`, `calendar-create`, `calendar-update`, `calendar-delete`, `event-list`, `event-get`, `event-create`, `event-update`, `event-delete`, `events-for-range`                   | Full calendar and event management with recurrence support      |
| **Tasks**    | `project-list`, `project-create`, `project-update`, `task-list`, `task-get`, `task-create`, `task-update`, `task-complete`, `task-delete`, `task-assign-category`, `task-remove-category` | Task and project management with categories                     |
| **People**   | `person-list`, `person-get`, `person-create`, `person-update`, `person-add-contact`, `person-add-address`, `person-add-date`                                                              | Contact management with methods, addresses, and important dates |
| **Shopping** | `shopping-list-list`, `shopping-list-get`, `shopping-list-create`, `shopping-item-add`, `shopping-item-update`, `shopping-item-delete`                                                    | Shopping list and item management                               |
| **Spaces**   | `space-list`, `space-get`, `space-add-member`, `space-update-member-role`                                                                                                                 | Multi-tenant space and membership management                    |
| **Sync**     | `sync-pull`                                                                                                                                                                               | Pull recent changes via the sync protocol                       |

### Resources (~12 read-only data sources)

- **Static listings**: `daykeeper://spaces`, `daykeeper://calendars`, `daykeeper://projects`,
  `daykeeper://categories`, `daykeeper://event-types`
- **Dynamic templates**: `daykeeper://space/{spaceId}`, `daykeeper://calendar/{calendarId}`,
  `daykeeper://event/{eventId}`, `daykeeper://task/{taskId}`, `daykeeper://person/{personId}`,
  `daykeeper://shopping-list/{listId}`
- **Schema reference**: `daykeeper://schema/entities`

### Prompts (6 interaction templates)

| Prompt               | Description                                               |
| -------------------- | --------------------------------------------------------- |
| `daily-planning`     | Plan your day with calendar events and open tasks         |
| `weekly-review`      | Review the week's accomplishments and plan ahead          |
| `meeting-prep`       | Prepare for a specific meeting with context and attendees |
| `shopping-assistant` | Build and manage a shopping list interactively            |
| `contact-lookup`     | Find and summarize contact details                        |
| `upcoming-birthdays` | Check for upcoming important dates in your contacts       |

## Tech Stack

| Tool                                                                                | Purpose                                             |
| ----------------------------------------------------------------------------------- | --------------------------------------------------- |
| [Bun](https://bun.sh)                                                               | Runtime, package manager, test runner               |
| [TypeScript](https://www.typescriptlang.org)                                        | Language (strict mode)                              |
| [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk) | Official MCP TypeScript SDK                         |
| [Zod](https://zod.dev)                                                              | Schema validation for tool inputs and API responses |
| [Biome](https://biomejs.dev)                                                        | Linter and formatter                                |
| [mise](https://mise.jdx.dev)                                                        | Version manager and task runner                     |
| [lefthook](https://github.com/evilmartians/lefthook)                                | Git hooks with parallel execution                   |

## Quick Start

### Prerequisites

- [mise](https://mise.jdx.dev/getting-started.html) installed
- A running Day Keeper API instance

### Install

```bash
# Install Bun via mise
mise install

# Install dependencies
bun install

# Copy environment config
cp .env.example .env
```

### Configure

Edit `.env` with your Day Keeper API details:

```bash
DAY_KEEPER_API_URL=http://localhost:8080
DAY_KEEPER_TENANT_ID=your-tenant-uuid
```

### Run

```bash
# Start in stdio mode (default)
mise run dev

# Start in HTTP mode
mise run dev-http

# Open MCP Inspector for interactive testing
mise run inspect
```

## Configuration

| Variable                      | Required | Default | Description                                     |
| ----------------------------- | -------- | ------- | ----------------------------------------------- |
| `DAY_KEEPER_API_URL`          | Yes      | —       | Base URL of the Day Keeper API                  |
| `DAY_KEEPER_TENANT_ID`        | Yes      | —       | Tenant UUID for `X-Tenant-Id` header            |
| `DAY_KEEPER_API_KEY`          | No       | —       | Bearer token for `Authorization` header         |
| `MCP_TRANSPORT`               | No       | `stdio` | Transport: `stdio` or `http`                    |
| `MCP_HTTP_PORT`               | No       | `3001`  | Port when using HTTP transport                  |
| `DAY_KEEPER_DEFAULT_SPACE_ID` | No       | —       | Default space ID for tools                      |
| `DAY_KEEPER_DEFAULT_TIMEZONE` | No       | `UTC`   | Default timezone for date operations            |
| `LOG_LEVEL`                   | No       | `info`  | Logging level: `debug`, `info`, `warn`, `error` |

## Connecting to Clients

### Claude Code

Add to `~/.claude/mcp_servers.json`:

```json
{
  "day-keeper": {
    "command": "bun",
    "args": ["run", "/path/to/day-keeper-mcp/src/index.ts"],
    "env": {
      "DAY_KEEPER_API_URL": "http://localhost:8080",
      "DAY_KEEPER_TENANT_ID": "your-tenant-uuid"
    }
  }
}
```

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "day-keeper": {
      "command": "bun",
      "args": ["run", "/path/to/day-keeper-mcp/src/index.ts"],
      "env": {
        "DAY_KEEPER_API_URL": "http://localhost:8080",
        "DAY_KEEPER_TENANT_ID": "your-tenant-uuid"
      }
    }
  }
}
```

## Development

```bash
# Run tests
mise run test

# Type-check
mise run typecheck

# Lint
mise run lint

# Lint with auto-fix
mise run lint-fix

# Interactive MCP Inspector
mise run inspect
```

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for the full developer guide.

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the complete architecture documentation,
including:

- MCP server design and transport strategy
- Day Keeper API mapping (GraphQL vs REST)
- Entity grouping and tool design philosophy
- Error handling and testing strategy

## ADRs

| ADR                                          | Decision                                        |
| -------------------------------------------- | ----------------------------------------------- |
| [0001](docs/adr/0001-mcp-sdk-choice.md)      | Official @modelcontextprotocol/sdk over FastMCP |
| [0002](docs/adr/0002-transport-strategy.md)  | stdio default, Streamable HTTP optional         |
| [0003](docs/adr/0003-api-client-approach.md) | Direct HTTP with hand-written GraphQL queries   |
| [0004](docs/adr/0004-tool-granularity.md)    | Domain-oriented separate tools (~30 total)      |
| [0005](docs/adr/0005-testing-strategy.md)    | bun:test with layered mocks                     |

## License

MIT
