#!/bin/bash
# Determine the directory of this script.
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."

# Get the absolute path for the config file (in the .cursor directory).
CONFIG_PATH=$(realpath "$PROJECT_ROOT/.cursor/mcp.json")

# Revert the configuration to the placeholder strings.
sed -i "s|\"command\": \"npx\"|\"command\": \"/path/to/node\"|g" "$CONFIG_PATH"
sed -i "s|\"args\": \[\"-y\", \"mcp-server-npms\"\]|\"args\": \[\"/path/to/mcp-server.js\"\]|g" "$CONFIG_PATH"

# Define color variables.
GREEN="\033[1;32m"
BLUE="\033[1;34m"
NC="\033[0m"  # No Color

echo -e "✅ ${GREEN}Reverted config file at:${NC}\n  ${BLUE}${CONFIG_PATH}${NC}"
echo -e "✅ ${GREEN}with command reverted to:${NC}\n  ${BLUE}/path/to/node${NC}"
echo -e "✅ ${GREEN}and args reverted to:${NC}\n  ${BLUE}[/path/to/mcp-server.js]${NC}"

echo -e "\n📝 ${GREEN}Reverted config file content:${NC}"
cat "$CONFIG_PATH"
