import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { VERSION } from "./version.js"
import { z } from "zod"

const server = new McpServer({
  name: "NPMs.io MCP Server",
  version: VERSION,
})

// Search endpoint
server.tool("search", "Search for npm packages with support for advanced filters and modifiers. The search query supports various qualifiers:\n" +
  "- scope:types - Show/filter results that belong to the @types scope\n" +
  "- author:username - Show/filter results by author\n" +
  "- maintainer:username - Show/filter results by maintainer\n" +
  "- keywords:keyword1,keyword2 - Show/filter results by keywords (use -keyword to exclude)\n" +
  "- not:deprecated - Exclude deprecated packages\n" +
  "- not:unstable - Exclude packages with version < 1.0.0\n" +
  "- not:insecure - Exclude insecure packages\n" +
  "- is:deprecated - Show only deprecated packages\n" +
  "- is:unstable - Show only unstable packages\n" +
  "- is:insecure - Show only insecure packages\n" +
  "- boost-exact:false - Disable exact match boosting\n" +
  "- score-effect:14 - Set score effect (default: 15.3)\n" +
  "- quality-weight:1 - Set quality weight (default: 1.95)\n" +
  "- popularity-weight:1 - Set popularity weight (default: 3.3)\n" +
  "- maintenance-weight:1 - Set maintenance weight (default: 2.05)\n\n" +
  "Response includes:\n" +
  "- package: Package data (name, version, etc.)\n" +
  "- flags: Package flags (deprecated, unstable, insecure)\n" +
  "- score: Package score details\n" +
  "- searchScore: Computed search score", {
  q: z.string().describe("The search query with support for filters and modifiers. Examples:\n" +
    "- 'react not:deprecated' - Search for non-deprecated React packages\n" +
    "- 'author:sindresorhus' - Search packages by author\n" +
    "- 'keywords:gulpplugin,not:deprecated' - Search for non-deprecated Gulp plugins"),
  from: z.number().min(0).max(10000).optional().default(0).describe("The offset to start searching from (max of 10000)"),
  size: z.number().min(1).max(250).optional().default(25).describe("The total number of results to return (max of 250)")
}, async ({ q, from, size }) => {
  const response = await fetch(`https://api.npms.io/v2/search?q=${encodeURIComponent(q)}&from=${from}&size=${size}`)
  const data = await response.json()
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
  }
})

// Search suggestions endpoint
server.tool("searchSuggestions", "Get package search suggestions. Note that any qualifiers in the query will be ignored.\n\n" +
  "Response includes:\n" +
  "- package: Package data (name, version, etc.)\n" +
  "- flags: Package flags (deprecated, unstable, insecure)\n" +
  "- score: Package score details\n" +
  "- searchScore: Computed search score\n" +
  "- highlight: Highlighted matched text", {
  q: z.string().describe("The search query (qualifiers will be ignored)"),
  size: z.number().min(1).max(100).optional().default(25).describe("The total number of suggestions to return (max of 100)")
}, async ({ q, size }) => {
  const response = await fetch(`https://api.npms.io/v2/search/suggestions?q=${encodeURIComponent(q)}&size=${size}`)
  const data = await response.json()
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
  }
})

// Get package info endpoint
server.tool("getPackageInfo", "Get detailed information about a package.\n\n" +
  "Response includes:\n" +
  "- analyzedAt: Date of last package analysis\n" +
  "- collected: Information from all sources\n" +
  "- evaluation: Package evaluation details\n" +
  "- score: Package score information\n" +
  "- error: Any error from last analysis attempt", {
  name: z.string().describe("The package name to get information for")
}, async ({ name }) => {
  const response = await fetch(`https://api.npms.io/v2/package/${encodeURIComponent(name)}`)
  const data = await response.json()
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
  }
})

// Get multiple packages info endpoint
server.tool("getMultiPackageInfo", "Get detailed information about multiple packages in a single request.\n\n" +
  "Response includes for each package:\n" +
  "- analyzedAt: Date of last package analysis\n" +
  "- collected: Information from all sources\n" +
  "- evaluation: Package evaluation details\n" +
  "- score: Package score information\n" +
  "- error: Any error from last analysis attempt", {
  names: z.array(z.string()).describe("Array of package names to get information for")
}, async ({ names }) => {
  const response = await fetch("https://api.npms.io/v2/package/mget", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(names)
  })
  const data = await response.json()
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
  }
})

const transport = new StdioServerTransport()
await server.connect(transport)
