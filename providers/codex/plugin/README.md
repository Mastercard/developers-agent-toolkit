# Mastercard Developers Codex Plugin

This directory contains the Codex-specific assets for the Mastercard Developers
plugin.

## What's here

| File | Purpose |
|------|---------|
| `.codex-plugin/plugin.json` | Plugin manifest (metadata, skills path, interface) |
| `.mcp.json` | Wires the remote Mastercard Developers MCP server (`https://developer.mcp.mastercard.com`, no authentication) |
| `skills/` | One subdirectory per skill (`mastercard-best-practices`) |

## MCP

The Mastercard Developers MCP server is a remote HTTP server that requires
**no authentication**, so no OAuth or app registration is needed. The
connection is declared directly in `.mcp.json`:

```json
{
  "mcpServers": {
    "mastercard-developers": {
      "type": "http",
      "url": "https://developer.mcp.mastercard.com"
    }
  }
}
```

## Skills

Skills live under `skills/`, one subdirectory each. The
`mastercard-best-practices` skill explains how to set up the MCP
server (remote and local via `npx -y @mastercard/developers-mcp`) and how to
access Mastercard documentation in `llms.txt` format.

## Installing

See the [top-level README](../../../README.md) for install commands. For Codex:

```bash
codex plugin add mastercard-developers@openai-curated
```

> **Note:** The `@openai-curated` command works once this plugin is accepted
> into OpenAI's curated registry. Until then, install directly from this
> repository as described in the
> [top-level README](../../../README.md#install-from-this-repository).
