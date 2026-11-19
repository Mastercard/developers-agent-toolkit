# Provider Plugins

This directory contains plugins for different AI code editors and agent harnesses.

Most providers share the same vendor-specific layout:

```
providers/<provider>/plugin/
├── skills/                 # Agent skills (mastercard-best-practices, mastercard-payload-encryption)
├── .mcp.json | mcp.json    # Mastercard Developers MCP server wiring
└── .<provider>-plugin/     # Provider-specific plugin manifest (plugin.json)
```

The exception is `agent-plugins`, which follows the portable [Agent Plugins v1](https://agent-plugins.org/specification) layout instead: a root `plugin.json` (no `.<provider>-plugin/` subdirectory). See the table below.

## Providers

| Provider | Plugin manifest | MCP config |
|----------|-----------------|------------|
| `claude` | `.claude-plugin/plugin.json` | `.mcp.json` |
| `codex`  | `.codex-plugin/plugin.json`  | `.mcp.json` |
| `cursor` | `.cursor-plugin/plugin.json` | `mcp.json`  |
| `agent-plugins` | `plugin.json` (root) | `mcp.json` |

The `agent-plugins` entry is a portable **[Agent Plugins v1](https://agent-plugins.org/specification)** package: one vendor-neutral directory (`plugin.json` + `mcp.json` + `skills/`) that any conformant client can load without a provider-specific manifest. It collapses the duplicated per-vendor "box" into a single layout. Client-only presentation data is kept in the vendor folders (e.g. `providers/codex/`) for now; the Agent Plugins schema reserves `extensions.<reverse.domain>` for it if needed later. See [`agent-plugins/plugin/README.md`](agent-plugins/plugin/README.md).

## MCP server

Every plugin connects to the remote Mastercard Developers MCP server at `https://developer.mcp.mastercard.com`, which requires **no authentication**. A local `npx -y @mastercard/developers-mcp` alternative is documented in [`modelcontextprotocol/`](../modelcontextprotocol/README.md).

## Skills

Each plugin ships two skills under `skills/`:

- `mastercard-best-practices` guides agents to resolve services, confirm the auth type, choose sandbox or production URLs and read authentication errors using the Mastercard Developers MCP server, and to reach Mastercard documentation in `llms.txt` format when the server is unavailable.
- `mastercard-payload-encryption` guides request and response payload encryption, including each service's encryption profile, the client-encryption libraries and encryption key handling.

> **Do not edit the skill copies under `providers/*/plugin/skills/`.** They are generated from the canonical [`skills/`](../skills/) directory at the repository root. Edit the canonical file, then run `node scripts/sync.js` to propagate the change to every provider. `node scripts/sync.js --check` (also run in CI) verifies the copies are in sync.
