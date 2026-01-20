# Mastercard Developers Agent Toolkit

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://developer.mastercard.com/_/_/src/global/assets/svg/mcdev-logo-light.svg">
  <img src="https://developer.mastercard.com/_/_/src/global/assets/svg/mcdev-logo-dark.svg" alt="mastercard developers logo">
</picture>

The Mastercard Developers Agent Toolkit allows popular agent frameworks (currently Model Context Protocol - MCP) to integrate with [Mastercard Developers](https://developer.mastercard.com) for service discovery and integration guides.

## Key Features

* **Service Discovery**: Enables agents to programmatically discover available services on the Mastercard Developers platform.
* **Integration Guide Access**: Provides access to detailed documentation and integration guides.
* **Flexible Deployment**: Can be run as a standalone server or integrated as a library in TypeScript/JavaScript projects.
* **MCP-Based**: Built on the Model Context Protocol (MCP) for standardized communication.

## Supported Tool Calls

The toolkit provides the following tools for agents to use:

### Services

* `get-services-list`: Lists all available Mastercard Developers Products and Services with their basic information including title, description, and service id.

### Documentation

* `get-documentation`: Provides an overview of all available documentation for a specific Mastercard service including section titles, descriptions, and navigation links.
* `get-documentation-section-content`: Retrieves the complete content for a specific documentation section.
* `get-documentation-page`: Retrieves the complete content of a specific documentation page.
* `get-oauth10a-integration-guide`: Retrieves the comprehensive OAuth 1.0a integration guide.
* `get-openfinance-integration-guide`: Retrieves the comprehensive Open Finance integration guide.

### API Operations

* `get-api-operation-list`: Provides a summary of all API operations for a specific Mastercard API specification including HTTP methods, request paths, titles, and descriptions.
* `get-api-operation-details`: Provides detailed information about a specific API operation including parameter definitions, request and response schemas, and technical specifications.

## Model Context Protocol

We provide a standalone Model Context Protocol (MCP) server that can be used with MCP clients.

```bash
npx -y @mastercard/developers-mcp
```

For more details for the configuration options, see [modelcontextprotocol](modelcontextprotocol/README.md) directory

### Installation

If you want to use the package in your project, you can install it using npm:

```bash
npm install --save @mastercard/developers-agent-toolkit
```

Requirements
- Node 18+

```javascript
import { MastercardDevelopersAgentToolkit } from "@mastercard/developers-agent-toolkit/mcp";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new MastercardDevelopersAgentToolkit({});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Mastercard Developers MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
```

For more details, checkout [typescript](typescript/README.md) directory

## Using the MCP server with MCP clients (Claude Code example)

The Mastercard Developers MCP server is designed to be used with a long-lived MCP client
(e.g., Claude Code, Cursor, or other MCP-enabled IDEs). It is not intended to be used as a
one-shot CLI command.

> **Note**
> Node.js 18+ must be available in your `PATH` for `npx` to work.

### Register the MCP server in Claude Code

Register the server using Claude Code’s MCP configuration command:

```bash
claude mcp add \
  --transport stdio \
  mastercard-developers \
  -- npx -y @mastercard/developers-mcp
```

(The server name mastercard-developers is arbitrary—you can choose any name.)

You can verify that the server is registered with:

```bash
claude mcp list
```

### Example prompts

Once registered, you can ask Claude questions such as:

- List all available Mastercard Developers services
- Show the documentation for the Open Banking US service
- List API operations for Mastercard Send

### Why piping input does not work

This MCP server communicates over a persistent stdio JSON-RPC session and expects an
interactive MCP client. As a result, piping a single request such as:

```bash
echo '{ ... }' | npx -y @mastercard/developers-mcp
```

is not supported.

## Contributing

Contributions are welcome. Please feel free to submit a pull request or open an issue to report a bug or suggest a feature.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
