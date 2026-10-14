# Mastercard Developers IBM Bob Plugin

This directory contains the IBM Bob-specific assets for the Mastercard Developers plugin.

## What's here

| File | Purpose |
|------|---------|
| `.bob-plugin/plugin.json` | Plugin manifest (metadata) |
| `mcp.json` | Runs the Mastercard Developers MCP server via `npx -y @mastercard/developers-mcp` (stdio transport) |
| `skills/` | One subdirectory per skill (`mastercard-best-practices`) |

## MCP

The Mastercard Developers MCP server is run locally via `npx`, requiring **no authentication** and no OAuth or app registration. The connection is declared in `mcp.json` using a `command`/`args` stdio transport:

```json
{
  "mcpServers": {
    "mastercard-developers": {
      "command": "npx",
      "args": ["-y", "@mastercard/developers-mcp"]
    }
  }
}
```

## Skills

Skills live under `skills/`, one subdirectory each. The `mastercard-best-practices` skill explains how to set up the Mastercard Developers MCP server (remote and local via `npx -y @mastercard/developers-mcp`) and how to access Mastercard documentation in `llms.txt` format.

## Installing

Installation is a two-step manual process.

### Step 1 — Install the skill

Install the `mastercard-best-practices` skill into Bob's `.bob/skills` folder using `npx skills` with the `-a bob` agent flag:

```bash
npx skills add Mastercard/developers-agent-toolkit -a bob
```

> **Note:** Manually installed skills don't auto-update. Run `npx skills update -y` to get the latest version.

### Step 2 — Add the MCP server

Add the following entry to your Bob MCP configuration:

- **Global** (all workspaces): `~/.bob/mcp.json`
- **Project** (current workspace only): `.bob/mcp.json`

```json
{
  "mcpServers": {
    "mastercard-developers": {
      "command": "npx",
      "args": ["-y", "@mastercard/developers-mcp"]
    }
  }
}
```

You can also open Bob's Settings → MCP tab and click **Edit Global MCP** or **Edit Project MCP** to add the entry via the IDE UI.

See the [top-level README](../../../README.md) for full usage instructions and example prompts.
