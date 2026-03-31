# ADR-0001: MCP SDK Choice

**Status**: Accepted **Date**: 2026-03-29

## Context

Two main TypeScript SDKs exist for building MCP servers:

1. **@modelcontextprotocol/sdk** — The official Tier 1 SDK maintained by Anthropic. Provides
   low-level control over server lifecycle, transport, and capability registration.
2. **FastMCP** — A community-built higher-level framework that simplifies server creation with less
   boilerplate, built-in health checks, and automatic transport handling.

This project's primary goal is **learning MCP development** — understanding the protocol internals,
transport mechanisms, and capability registration patterns.

## Decision

Use the official `@modelcontextprotocol/sdk` directly.

## Alternatives Considered

### FastMCP

**Pros**:

- Less boilerplate code
- Built-in health checks, monitoring, and error handling
- Simplified API for defining tools, resources, and prompts
- OAuth integration out of the box

**Cons**:

- Abstracts away transport and registration details we want to learn
- Third-party dependency with its own release cadence
- Adds an abstraction layer between us and the protocol

### Official SDK

**Pros**:

- Direct access to all MCP protocol features
- Deepest understanding of how MCP works
- No abstraction overhead — what you write is what runs
- First-party maintenance and documentation
- 66M+ npm downloads, 27K+ dependent packages

**Cons**:

- More boilerplate for server setup
- Manual transport configuration
- Need to implement our own error handling patterns

## Consequences

- **Positive**: Deeper learning of MCP internals. Full control over server behavior. No risk of
  framework limitations blocking feature exploration.
- **Positive**: Code directly maps to MCP specification concepts, making it a better reference
  implementation.
- **Negative**: More code to write for server setup, transport selection, and error handling.
- **Negative**: Need to implement patterns that FastMCP provides out of the box (e.g., structured
  error responses, health checks).
- **Tradeoff**: If this were a production project optimizing for developer velocity, FastMCP would
  be the better choice. For a learning project, the official SDK is correct.
