# NPMs.io MCP Server

## Overview

**MCP (Model Context Protocol)** is a framework that allows you to integrate custom tools into AI-assisted development environments—such as Cursor AI. MCP servers expose functionality (like data retrieval or code analysis) so that an LLM-based IDE can call these tools on demand. Learn more about MCP in the [Model Context Protocol Introduction](https://modelcontextprotocol.io/introduction).

This project demonstrates an MCP server built in Node.js that provides powerful NPM package search and information retrieval capabilities through the npms.io API. It offers tools for searching packages, getting package suggestions, and retrieving detailed package information.

## Requirements

- **Node.js:** Version 20 or higher is required.

## Features

- **MCP Integration:** Exposes NPM package search and information tools to LLM-based IDEs.
- **Advanced Package Search:** Search for NPM packages with support for various filters and modifiers:
  - Scope filtering (e.g., `scope:types`)
  - Author and maintainer filtering
  - Keyword-based filtering
  - Package status filtering (deprecated, unstable, insecure)
  - Search score customization
- **Search Suggestions:** Get package name suggestions with highlighted matches
- **Package Information:** Retrieve detailed information about single or multiple packages
- **Input Validation:** Uses [Zod](https://github.com/colinhacks/zod) for schema validation
- **Standard I/O Transport:** Connects via `StdioServerTransport` for integration with development environments

## Installation

1. **Clone the Repository**

   ```bash
   git clone <repository_url>
   cd <repository_directory>
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

## Integrating with Cursor AI

This project includes a `./cursor` subdirectory that contains an `mcp.json` file for configuring the MCP server. Cursor AI uses this file to automatically discover and launch your MCP server.

### The `./cursor/mcp.json` Structure

```json
{
  "mcpServers": {
    "npms": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-server-npms"
      ]
    }
  }
}
```

You can verify the absolute path to your Node.js executable by running `which node` in your terminal.

### Optional: Configuration Automation Scripts

Easily configure your local environment by automatically updating the mcp.json file with the correct absolute paths:

```bash
chmod +x ./scripts/update_config.sh
./scripts/update_config.sh
```

### Optional: Global Cursor settings

You can also move the `mcp.json` file to your global Cursor AI configuration directory located at `~/.cursor` to make the configuration available globally.

## Using the MCP Tools in Cursor Composer (Agent Mode)

With the MCP server integrated into Cursor AI and with Agent mode enabled in Cursor Composer, you can use natural language prompts like:

```
search for react packages that are not deprecated
```

```
get information about the express package
```

```
get suggestions for "react-router"
```

The AI agent will infer the appropriate tool from your MCP server and execute it accordingly.

## Available Tools

### Search Tool
Search for NPM packages with advanced filtering capabilities:

- **Query Parameters:**
  - `q`: Search query with support for filters and modifiers
  - `from`: Offset to start searching from (0-10000)
  - `size`: Number of results to return (1-250)

### Search Suggestions Tool
Get package name suggestions:

- **Query Parameters:**
  - `q`: Search query (qualifiers are ignored)
  - `size`: Number of suggestions to return (1-100)

### Package Information Tools
Get detailed information about packages:

- **Single Package:**
  - `name`: Package name to get information for

- **Multiple Packages:**
  - `names`: Array of package names to get information for

## What is MCP?

**Model Context Protocol (MCP)** provides a standardized approach to integrate custom tools into AI-assisted development environments. With MCP, you can define tools that perform specific tasks—such as retrieving external data, validating code, or enforcing coding standards—and the AI assistant in your IDE can call these tools automatically based on context. This helps improve developer productivity, ensures consistent quality, and streamlines workflows.

## References & Resources

- [Model Context Protocol: typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk)
- [Use Your Own MCP on Cursor in 5 Minutes](https://dev.to/andyrewlee/use-your-own-mcp-on-cursor-in-5-minutes-1ag4)
- [Model Context Protocol Introduction](https://modelcontextprotocol.io/introduction)
- [npms.io API Documentation](https://npms.io)

## License

This project is licensed under the [MIT License](LICENSE).
