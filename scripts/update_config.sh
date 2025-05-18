#!/bin/bash
# Determine the directory of this script.
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."

# Get the absolute path for the config file (in the .cursor directory).
CONFIG_PATH=$(realpath "$PROJECT_ROOT/.cursor/mcp.json")

# Replace the placeholders with actual configuration.
sed -i "s|\"command\": \"/path/to/node\"|\"command\": \"npx\"|g" "$CONFIG_PATH"
sed -i "s|\"args\": \[\"/path/to/mcp-server.js\"\]|\"args\": \[\"-y\", \"mcp-server-npms\"\]|g" "$CONFIG_PATH"

# Define color variables.
GREEN="\033[1;32m"
BLUE="\033[1;34m"
NC="\033[0m"  # No Color

echo -e "✅ ${GREEN}Updated config file at:${NC}\n  ${BLUE}${CONFIG_PATH}${NC}"
echo -e "✅ ${GREEN}with command:${NC}\n  ${BLUE}npx${NC}"
echo -e "✅ ${GREEN}and args:${NC}\n  ${BLUE}[-y, mcp-server-npms]${NC}"

echo -e "\n📝 ${GREEN}Updated config file content:${NC}"
cat "$CONFIG_PATH"

