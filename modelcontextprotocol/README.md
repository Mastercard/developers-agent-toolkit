# Mastercard Developers MCP Server

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://developer.mastercard.com/_/_/src/global/assets/svg/mcdev-logo-light.svg">
  <img src="https://developer.mastercard.com/_/_/src/global/assets/svg/mcdev-logo-dark.svg" alt="mastercard developers logo">
</picture>

A Model Context Protocol (MCP) server that provides access to Mastercard Developers documentation.

## Overview

This MCP server acts as a bridge between MCP clients and Mastercard Developers resources, offering tools to:

- List available Mastercard services
- Query API specifications and their operations
- Access documentation for each service
- Retrieve integration guides for OAuth 1.0a, OAuth 2.0, and Open Finance

## Available Tools

### Service Discovery

- **`get-services-list`**: Lists all available Mastercard Developers Products and Services with their basic information including title, description, and service ID.

### Documentation

- **`get-documentation`**: Provides an overview of all available documentation for a specific Mastercard service including section titles, descriptions, and navigation links.

- **`get-documentation-section-content`**: Retrieves the complete content for a specific documentation section.

- **`get-documentation-page`**: Retrieves the complete content of a specific documentation page.

### API Operations

- **`get-api-operation-list`**: Provides a summary of all API operations for a specific Mastercard API specification including HTTP methods, request paths, titles, and descriptions.

- **`get-api-operation-details`**: Provides detailed information about a specific API operation including parameter definitions, request and response schemas, and technical specifications for successful API calls.

### Integration Guides

- **`get-oauth10a-integration-guide`**: Retrieves the comprehensive OAuth 1.0a integration guide including step-by-step instructions, code examples, and best practices for Mastercard APIs.

- **`get-oauth20-integration-guide`**: Retrieves the comprehensive OAuth 2.0 integration guide including step-by-step instructions, code examples, and best practices for Mastercard APIs.

- **`get-openfinance-integration-guide`**: Retrieves the comprehensive Open Finance integration guide including setup instructions, API usage examples, and implementation best practices.

## Configuration Options

You can pre-configure the server with a specific service or API specification by passing them as arguments.
This is useful when you are working with a specific service, and you want to focus your agents

- `service`: URL of the documentation of a service that you want the MCP to focus on e.g. `https://developer.mastercard.com/mdes-customer-service/documentation`
- `api-specification`: URL of the API specification that you want the MCP tools to focus on e.g. `https://static.developer.mastercard.com/content/match/swagger/match-pro.yaml`. You can get the link from `Download Spec` button in the `API Reference` page of service.
  NOTE: Specifying this will override any value provided in `service` configuration.

If you specify `service` or `api-specification` then the `get-services-list` tool will be disabled.

## Integration with MCP Clients

To use this server with MCP clients like Claude Desktop, add it to your MCP configuration:

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

**For Specific Service**

```json
{
  "mcpServers": {
    "mastercard-developers": {
      "command": "npx",
      "args": [
        "-y",
        "@mastercard/developers-mcp",
        "--service=https://developer.mastercard.com/open-finance-us/documentation/"
      ]
    }
  }
}
```

**For Specific API Specification**

```json
{
  "mcpServers": {
    "mastercard-developers": {
      "command": "npx",
      "args": [
        "-y",
        "@mastercard/developers-mcp",
        "--api-specification=https://developer.mastercard.com/open-finance-us/swagger/openbanking-us.yaml"
      ]
    }
  }
}
```

## Usage with VSCode

For quick installation, use one of the one-click installation buttons below:

[![Install with NPX in VS Code](https://img.shields.io/badge/VS_Code-NPM-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=mastercard-developers&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%40mastercard%2Fdevelopers-mcp%22%5D%7D) [![Install with NPX in VS Code Insiders](https://img.shields.io/badge/VS_Code_Insiders-NPM-24bfa5?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=mastercard-developers&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%40mastercard%2Fdevelopers-mcp%22%5D%7D&quality=insiders)

For manual installation, add the following JSON block to your User Settings (JSON) file in VS Code. You can do this by pressing Ctrl + Shift + P and typing Preferences: Open Settings (JSON).

Optionally, you can add it to a file called .vscode/mcp.json in your workspace. This will allow you to share the configuration with others.

> Note that the mcp key is not needed in the .vscode/mcp.json file.

### NPX

```json
{
  "mcp": {
    "servers": {
      "mastercard-developers": {
        "command": "npx",
        "args": ["-y", "@mastercard/developers-mcp"]
      }
    }
  }
}
```

You can also provide configuration options as arguments, see above for examples.

## Development

Pre-requisites: Node.js 18+

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```
3. Run tests:

   ```bash
   npm run test
   ```

4. Start the server:
   ```bash
    npm run start
   ```

Watch for changes during development:

```bash
npm run watch
```

The server runs on stdio and will be available for MCP client connections.

#### With Configuration Options

```bash
# Pre-configure with a documentation URL
npm run start -- --service=https://developer.mastercard.com/open-finance-us/documentation/

# Pre-configure with an API specification path
npm run start -- --api-specification=https://static.developer.mastercard.com/content/open-finance-us/swagger/openbanking-us.yaml
```

### To build the DXT file

You can build the [DXT](https://github.com/anthropics/dxt) file for one-click installation for Claude Desktop by running:

```bash
npm run build-dxt
```

### Debugging the server

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

## References

- [Mastercard Developers Platform](https://developer.mastercard.com/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP SDKs](https://github.com/modelcontextprotocol)
