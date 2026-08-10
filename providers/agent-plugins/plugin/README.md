# Agent Plugin (portable)

This directory is a portable **[Agent Plugins v1](https://agent-plugins.org/specification)**
package — a single, vendor-neutral layout that any conformant client (Claude
Code, Codex, Cursor, Gemini CLI, Antigravity, …) can load without a
provider-specific manifest.

```
plugin/
├── plugin.json   # Agent Plugins manifest ($schema + name + metadata)
├── mcp.json      # MCP server wiring (type: streamable-http)
└── skills/       # mastercard-developers-bestpractice (synced from /skills)
```

## Why this exists

The `providers/claude`, `providers/codex`, and `providers/cursor` folders each
carry a near-identical copy of the same skill + MCP server wrapped in a
different vendor manifest shape. Agent Plugins collapses that duplicated "box"
into one portable directory:

| Concern | Vendor-specific plugins | Agent Plugin |
| --- | --- | --- |
| Manifest | `.claude-plugin/`, `.codex-plugin/`, `.cursor-plugin/` | single root `plugin.json` |
| MCP config | `.mcp.json` / `mcp.json`, `type: "http"` | `mcp.json`, `type: "streamable-http"` |
| Client-only fields | top-level (e.g. Codex `interface`) | `extensions.<reverse.domain>` (sanctioned home; see note) |

> **Client-only metadata is intentionally not duplicated here yet.** The Codex
> `interface` block (catalog display name, category, brand color, etc.) still
> lives in [`providers/codex/`](../../codex/). The Agent Plugins schema is
> closed, so any such client-specific data would have to move under
> `extensions."<reverse.domain>"` — but the exact namespace a client reads is
> client-defined and unverified for us, so we keep the portable manifest lean
> and vendor-neutral until a client confirms both native `plugin.json` loading
> and its extension namespace.

## Notable spec differences from the vendor copies

- **MCP transport type** is `"streamable-http"` (the Agent Plugins value for a
  remote MCP endpoint), not the vendor-native `"http"`.
- **`$schema` is required** on both `plugin.json` and `mcp.json`.
- **Client-specific data** (e.g. the Codex `interface` block) is **not**
  duplicated here — it stays in [`providers/codex/`](../../codex/). If a client
  ever needs it in the portable manifest, it must go under
  `extensions."<reverse.domain>"`, because the manifest schema is closed and
  rejects unknown top-level fields.

## Skills

The `skills/` copy is generated from the canonical [`/skills`](../../../skills)
directory by `node scripts/sync.js`. Do not edit it directly.
