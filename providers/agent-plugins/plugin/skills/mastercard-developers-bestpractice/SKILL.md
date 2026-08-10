---
name: mastercard-developers-bestpractice
description: Best practices for AI agents using the Mastercard Developers platform
metadata:
  author: mastercard-developers
  version: "1.0.0"
  audience: api-integration-agents
---

# Mastercard Developers MCP Server

The Mastercard Developers Agent Toolkit exposes Mastercard's product
documentation, API specifications, and integration guides to AI agents
through a Model Context Protocol (MCP) server. Once the server is
connected, call its tools to discover services, inspect API operations
and schemas, read official documentation, and generate integration code
grounded in current Mastercard Developers content instead of relying on
training data.

Use this skill to set up the server in an MCP client, and to drive the
server's tools when answering questions about Mastercard APIs.

## Choosing remote vs local

| | Remote (recommended) | Local |
| --- | --- | --- |
| Setup | Add one URL; nothing to install | Runs `@mastercard/developers-mcp` via `npx` |
| Requirements | MCP client only | Node.js + `npx` on the machine |
| Best for | Most users; fastest start | Scoping to one service/spec, local tooling, customization |
| Scope flags | Not available | Supports `--service` and `--api-specification` |

The remote server URL is `https://developer.mcp.mastercard.com` and
requires **no authentication**. Choose local only when you need the
`--service` / `--api-specification` flags or tighter local control.

## Set up the remote server

Pick the entry that matches the MCP client, write the config, then
reload or restart the client.

### Claude Code

Run:

```bash
claude mcp add --transport http mastercard-developers https://developer.mcp.mastercard.com
```

### VS Code

Add to `.vscode/mcp.json` in the workspace:

```json
{
  "servers": {
    "mastercard-developers": {
      "type": "http",
      "url": "https://developer.mcp.mastercard.com"
    }
  }
}
```

### Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "mastercard-developers": {
      "url": "https://developer.mcp.mastercard.com"
    }
  }
}
```

### ChatGPT and other MCP clients

Add a custom connector or server with:

- URL: `https://developer.mcp.mastercard.com`
- Authentication: **No authentication**

## Set up the local server

The local server runs through `npx`, so Node.js must be installed. The
launch command is always `npx -y @mastercard/developers-mcp`, optionally
followed by a scope flag (see below).

### Claude Desktop

Add to `claude_desktop_config.json` (or install the prebuilt `.dxt`
extension from Mastercard Developers, which writes the same entry):

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

### VS Code

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "mastercard-developers": {
      "command": "npx",
      "args": ["-y", "@mastercard/developers-mcp"]
    }
  }
}
```

### Cursor and other MCP clients

Add to `~/.cursor/mcp.json` (or the client's MCP config file):

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

## Scope the local server with flags

Flags are **local-only** and limit what the server exposes, which
reduces noise and focuses the agent on one API.

| Flag | Effect | Example value |
| --- | --- | --- |
| `--service` | Restrict the server to one service's documentation | `https://developer.mastercard.com/open-banking-us/documentation/` |
| `--api-specification` | Point the server at one raw OpenAPI/Swagger spec | `https://static.developer.mastercard.com/content/match/swagger/match-pro.yaml` |

If both are supplied, `--api-specification` takes priority over
`--service`.

Pass a flag as an extra entry in `args`, using `--flag=value` form.

Scope to a single service:

```json
{
  "mcpServers": {
    "mastercard-developers": {
      "command": "npx",
      "args": [
        "-y",
        "@mastercard/developers-mcp",
        "--service=https://developer.mastercard.com/open-banking-us/documentation/"
      ]
    }
  }
}
```

Scope to a single API specification (overrides `--service`):

```json
{
  "mcpServers": {
    "mastercard-developers": {
      "command": "npx",
      "args": [
        "-y",
        "@mastercard/developers-mcp",
        "--api-specification=https://static.developer.mastercard.com/content/match/swagger/match-pro.yaml"
      ]
    }
  }
}
```

## Verify the connection

After configuring a client, confirm the server is live before relying
on it:

- The client lists `mastercard-developers` among its connected MCP
  servers/tools.
- A `get-services-list` call returns a non-empty list of services.

If the tools do not appear:

- Reload or restart the MCP client after editing its config.
- Remote: confirm the URL is exactly
  `https://developer.mcp.mastercard.com` and that authentication is set
  to none.
- Local: confirm Node.js and `npx` are installed and that `args` is a
  JSON array of strings (`["-y", "@mastercard/developers-mcp"]`).
- Confirm the config key matches the client: `servers` for VS Code,
  `mcpServers` for Cursor, Claude Desktop, and other clients.

# Documentation in llms.txt format

As an alternative to using the MCP, you can access documentation directly in Markdown format.

Visit https://developer.mastercard.com/llms.txt for an overview of all Mastercard Developers APIs.

The full documentation for each service is available by appending llms-full.txt to the end of 
the main documentation URL - for example 
https://developer.mastercard.com/eligibility-api/documentation/llms-full.txt