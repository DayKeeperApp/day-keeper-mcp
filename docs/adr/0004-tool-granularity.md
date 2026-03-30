# ADR-0004: Tool Granularity

**Status**: Accepted
**Date**: 2026-03-29

## Context

The Day Keeper API exposes CRUD operations on 22 entity types. We need to decide how to map these to MCP tools. The granularity choice affects:

- **LLM discoverability** — Can the model find the right tool?
- **Tool count** — Too many tools overwhelm; too few require complex parameters
- **Composability** — Can tools be combined for multi-step workflows?

## Decision

Use **domain-oriented separate tools** with approximately **30 tools** across 6 domain files.

Each distinct action gets its own tool (e.g., `task-create`, `task-update`, `task-complete` are separate), but tools are grouped by domain in the source code.

### Naming Convention

`{domain}-{action}` using kebab-case:
- `calendar-list`, `calendar-create`
- `event-list`, `event-create`, `events-for-range`
- `task-list`, `task-create`, `task-complete`
- `person-list`, `person-add-contact`
- `shopping-list-list`, `shopping-item-add`
- `space-list`, `space-add-member`
- `sync-pull`

## Alternatives Considered

### One tool per entity per operation (~60+ tools)

Full CRUD for all 22 entity types would produce 60+ tools. This overwhelms LLMs — tool selection accuracy drops significantly above ~40 tools. Many entity operations (e.g., `createRecurrenceException`, `updateDeviceNotificationPreference`) are too low-level for typical LLM interactions.

### Mega-tools with action parameter (~10 tools)

A single `calendar` tool with `action: "list" | "create" | "update" | "delete" | "events-for-range"` reduces tool count but makes each tool's schema complex and harder for LLMs to reason about. Error messages become ambiguous ("invalid input for calendar tool" vs "invalid input for calendar-create").

### Domain-oriented separate tools (~30 tools, chosen)

Focus on the operations an LLM would actually use in conversation. Skip low-level operations (e.g., individual EventReminder CRUD, Device management) and group related sub-entity operations into parent tools where it makes sense.

## Consequences

- **Positive**: ~30 tools is within the sweet spot for LLM tool selection accuracy.
- **Positive**: Each tool has a clear, specific purpose with a focused input schema.
- **Positive**: Tool names are self-descriptive — an LLM can infer what `events-for-range` does.
- **Positive**: Easy to add more tools later without refactoring existing ones.
- **Negative**: Some less-common operations (device management, individual reminder CRUD) are not exposed as tools. These can be added later if needed.
- **Negative**: Related operations (e.g., `task-create` and `task-assign-category`) require separate tool calls. This is intentional — it keeps each tool simple and composable.
