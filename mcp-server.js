#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { VERSION } from "./version.js"
import { z } from "zod"

const server = new McpServer({
  name: "NPMs.io MCP Server",
  version: VERSION,
})

/**
 * @api {tool} search Search for npm packages
 * @apiName Search
 * @apiGroup NPM
 * @apiDescription Search for npm packages with support for advanced filters and modifiers
 * 
 * @apiParam {String} q Search query with support for filters and modifiers:
 *   - scope:types - Show/filter results that belong to the @types scope
 *   - author:username - Show/filter results by author
 *   - maintainer:username - Show/filter results by maintainer
 *   - keywords:keyword1,keyword2 - Show/filter results by keywords (use -keyword to exclude)
 *   - not:deprecated - Exclude deprecated packages
 *   - not:unstable - Exclude packages with version < 1.0.0
 *   - not:insecure - Exclude insecure packages
 *   - is:deprecated - Show only deprecated packages
 *   - is:unstable - Show only unstable packages
 *   - is:insecure - Show only insecure packages
 *   - boost-exact:false - Disable exact match boosting
 *   - score-effect:14 - Set score effect (default: 15.3)
 *   - quality-weight:1 - Set quality weight (default: 1.95)
 *   - popularity-weight:1 - Set popularity weight (default: 3.3)
 *   - maintenance-weight:1 - Set maintenance weight (default: 2.05)
 * @apiParam {Number} [from=0] Offset to start searching from (0-10000)
 * @apiParam {Number} [size=25] Number of results to return (1-250)
 * 
 * @apiSuccess {Object} content Response content
 * @apiSuccess {String} content.type Content type
 * @apiSuccess {String} content.text JSON string containing:
 *   - package: Package data (name, version, etc.)
 *   - flags: Package flags (deprecated, unstable, insecure)
 *   - score: Package score details
 *   - searchScore: Computed search score
 */
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

/**
 * @api {tool} search_suggestions Get package search suggestions
 * @apiName Search
 * @apiGroup NPM
 * @apiDescription Get package name suggestions with highlighted matches
 * 
 * @apiParam {String} q Search query (qualifiers will be ignored)
 * @apiParam {Number} [size=25] Number of suggestions to return (1-100)
 * 
 * @apiSuccess {Object} content Response content
 * @apiSuccess {String} content.type Content type
 * @apiSuccess {String} content.text JSON string containing:
 *   - package: Package data (name, version, etc.)
 *   - flags: Package flags (deprecated, unstable, insecure)
 *   - score: Package score details
 *   - searchScore: Computed search score
 *   - highlight: Highlighted matched text
 */
server.tool("search_suggestions", "Get package search suggestions. Note that any qualifiers in the query will be ignored.\n\n" +
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

/**
 * @api {tool} get_package_info Get package information
 * @apiName Package
 * @apiGroup NPM
 * @apiDescription Get detailed information about a package
 * 
 * @apiParam {String} name Package name to get information for
 * 
 * @apiSuccess {Object} content Response content
 * @apiSuccess {String} content.type Content type
 * @apiSuccess {String} content.text JSON string containing:
 *   - analyzedAt: Date of last package analysis
 *   - collected: Information from all sources
 *   - evaluation: Package evaluation details
 *   - score: Package score information
 *   - error: Any error from last analysis attempt
 */
server.tool("get_package_info", "Get detailed information about a package.\n\n" +
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

/**
 * @api {tool} get_multi_package_info Get multiple packages information
 * @apiName Package
 * @apiGroup NPM
 * @apiDescription Get detailed information about multiple packages in a single request
 * 
 * @apiParam {String[]} names Array of package names to get information for
 * 
 * @apiSuccess {Object} content Response content
 * @apiSuccess {String} content.type Content type
 * @apiSuccess {String} content.text JSON string containing for each package:
 *   - analyzedAt: Date of last package analysis
 *   - collected: Information from all sources
 *   - evaluation: Package evaluation details
 *   - score: Package score information
 *   - error: Any error from last analysis attempt
 */
server.tool("get_multi_package_info", "Get detailed information about multiple packages in a single request.\n\n" +
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
