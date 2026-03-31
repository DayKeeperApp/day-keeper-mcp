# ADR-0002: Transport Strategy

**Status**: Accepted **Date**: 2026-03-29

## Context

MCP supports multiple transport mechanisms for client-server communication:

1. **stdio** — Communication via stdin/stdout using JSON-RPC. The MCP host spawns the server as a
   subprocess.
2. **Streamable HTTP** — Modern HTTP-based transport supporting both stateless and stateful
   deployments.
3. **HTTP+SSE** — Deprecated older transport using Server-Sent Events.

Most MCP hosts (Claude Code, Claude Desktop, Cursor) use stdio by default. Remote/multi-client
scenarios require HTTP.

## Decision

Use **stdio as the default transport**, with **Streamable HTTP as an optional alternative**
configured via the `MCP_TRANSPORT` environment variable.

- `MCP_TRANSPORT=stdio` (default): Uses `StdioServerTransport` from the SDK
- `MCP_TRANSPORT=http`: Uses `StreamableHTTPServerTransport` with `Bun.serve()` on `MCP_HTTP_PORT`
  (default: 3001)

## Alternatives Considered

### stdio only

Would simplify the codebase but prevent remote access and multi-client scenarios. Since this is a
learning project, implementing both transports provides more protocol understanding.

### HTTP only

Would require additional configuration for local MCP hosts that expect to spawn a subprocess. Most
current MCP integrations use stdio.

### HTTP+SSE (deprecated)

Older transport that has been superseded by Streamable HTTP. No reason to implement a deprecated
transport.

## Consequences

- **Positive**: Zero-config for the most common use case (Claude Code, Claude Desktop spawning via
  stdio).
- **Positive**: HTTP option enables remote access, development/testing with MCP Inspector, and
  potential Cloudflare Tunnel exposure alongside the Day Keeper API.
- **Positive**: Learning both transport implementations deepens MCP protocol understanding.
- **Negative**: Two code paths to maintain (though the transport layer is thin).
- **Negative**: HTTP transport requires additional security considerations (authentication, CORS) in
  production — acceptable for a learning project.
