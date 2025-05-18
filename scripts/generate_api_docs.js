#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.join(__dirname, '..')

// Read the MCP server file
const mcpServerPath = path.join(PROJECT_ROOT, 'mcp-server.js')
const mcpServerContent = fs.readFileSync(mcpServerPath, 'utf-8')

// Find JSDoc blocks
const jsdocBlocks = mcpServerContent.match(/\/\*\*[\s\S]*?\*\//g) || []
const tools = []

// Process each JSDoc block
jsdocBlocks.forEach(block => {
  // Skip if not an API tool definition
  if (!block.includes('@api {tool}')) return

  // Extract tool name
  const toolNameMatch = block.match(/@api\s+{tool}\s+(\S+)/)
  if (!toolNameMatch) return
  const toolName = toolNameMatch[1]

  // Extract description
  const descriptionMatch = block.match(/@apiDescription\s+([^\n]+)/)
  const description = descriptionMatch ? descriptionMatch[1].trim() : ''

  // Extract parameters
  const paramMatches = [...block.matchAll(/@apiParam\s+{([^}]+)}\s+([^\n]+)(?:\n(?:[ \t]*\*[ \t]*(?!@api)[^\n]*)?)*(?=\n\s*\*\s*@|$)/g)]
  const params = []
  
  paramMatches.forEach(match => {
    const paramType = match[1]
    const paramDesc = match[2]
    const paramName = paramDesc.split(' ')[0]
    
    // Get the description without parameter modifiers
    let paramDescription = paramDesc.substring(paramName.length).trim()
    
    // Find the first dash in the description - this would indicate a list
    const dashIndex = paramDescription.indexOf(' - ')
    if (dashIndex > 0) {
      paramDescription = paramDescription.substring(0, dashIndex)
    }
    
    // Add parameter with type
    params.push(`\`${paramName}\` (${paramType}): ${paramDescription}`)
    
    // Process multiline parameter description for modifiers
    const lines = match[0].split('\n')
      .map(line => line.trim().replace(/^\*\s*/, ''))
      .filter(line => line && !line.startsWith('@api'))
    
    // Get modifiers as sub-bullets (only those starting with dash)
    const modifiers = lines
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.trim())
      // Filter out response-field-like entries that got mixed into parameters
      .filter(line => !line.includes('package:') && 
                      !line.includes('flags:') && 
                      !line.includes('score:') && 
                      !line.includes('searchScore:') &&
                      !line.includes('highlight:') &&
                      !line.includes('analyzedAt:') &&
                      !line.includes('collected:') &&
                      !line.includes('evaluation:') &&
                      !line.includes('error:'))
    
    if (modifiers.length > 0) {
      modifiers.forEach(modifier => {
        params.push(`  ${modifier}`)
      })
    }
  })

  // Extract response fields
  const responseFields = []
  
  // Look for these fields that contain response data in the entire block
  const fieldPrefixes = [
    'package:', 'flags:', 'score:', 'searchScore:', 'highlight:',
    'analyzedAt:', 'collected:', 'evaluation:', 'error:'
  ]
  
  // Extract all lines from JSDoc block
  const allLines = block.split('\n')
    .map(line => line.trim().replace(/^\*\s*/, ''))
    .filter(line => line && !line.startsWith('@api') && line.trim().startsWith('-'))
  
  // Filter to only response fields
  fieldPrefixes.forEach(prefix => {
    const matchingFields = allLines
      .filter(line => line.includes(prefix))
      .map(line => line.trim().substring(1).trim())
    
    matchingFields.forEach(field => {
      if (!responseFields.includes(field)) {
        responseFields.push(field)
      }
    })
  })

  tools.push({
    name: toolName,
    description,
    params,
    responseFields
  })
})

// Generate markdown documentation
const generateMarkdown = () => {
  let markdown = `## API

### Resources

- \`https://api.npms.io/v2\`: NPM package search and information interface

### Tools\n\n`

  tools.forEach(tool => {
    markdown += `- **${tool.name}**\n`
    markdown += `  - ${tool.description}\n`
    
    if (tool.params.length > 0) {
      markdown += '  - Inputs:\n'
      tool.params.forEach(param => {
        markdown += `    ${param}\n`
      })
    }
    
    if (tool.responseFields.length > 0) {
      markdown += '  - Returns: JSON object containing:\n'
      tool.responseFields.forEach(field => {
        markdown += `    - ${field}\n`
      })
    } else {
      markdown += '  - Returns: JSON object with package information\n'
    }
    
    markdown += '\n'
  })

  return markdown
}

// Read the README
const readmePath = path.join(PROJECT_ROOT, 'README.md')
let readmeContent = fs.readFileSync(readmePath, 'utf-8')

// Replace the API documentation section
const apiDocsStart = '<!-- API_DOCS_START -->'
const apiDocsEnd = '<!-- API_DOCS_END -->'
const startIndex = readmeContent.indexOf(apiDocsStart)
const endIndex = readmeContent.indexOf(apiDocsEnd)

if (startIndex !== -1 && endIndex !== -1) {
  const newApiDocs = generateMarkdown()
  readmeContent = readmeContent.substring(0, startIndex + apiDocsStart.length) + 
                  '\n' + newApiDocs + 
                  readmeContent.substring(endIndex)
  
  // Write the updated README
  fs.writeFileSync(readmePath, readmeContent)
  console.log('✅ API documentation updated in README.md')
} else {
  console.error('❌ Could not find API documentation placeholders in README.md')
  process.exit(1)
} 