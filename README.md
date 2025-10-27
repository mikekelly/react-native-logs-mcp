# React Native Debugger MCP

An MCP server that connects to your React Native application debugger via the Chrome DevTools Protocol.

## ✨ Key Features

-   **Complete Console Log Retrieval**: Captures full console output from Metro bundler including:

    -   Multi-line strings and template literals
    -   Complete object structures with nested properties
    -   Arrays with all elements and their types
    -   Complex data structures (Maps, Sets, Dates, etc.)
    -   Error objects with full stack traces
    -   All console levels (log, info, warn, error, debug)

-   **Enhanced Formatting**: Uses Chrome DevTools Protocol's rich formatting to preserve:
    -   Original object structure and formatting
    -   Multi-line content without truncation
    -   Proper type representation for all JavaScript values
    -   Readable output for debugging complex applications

## 🚀 Quick Start

Add the following to your Claude Desktop/Cursor MCP config:

```json
{
	"mcpServers": {
		"react-native-debugger-mcp": {
			"command": "npx",
			"args": ["-y", "@twodoorsdev/react-native-debugger-mcp"]
		}
	}
}
```

## 🔧 Available Tools

### `getConnectedApps`

Retrieves a list of React Native applications currently connected to the Metro bundler.

**Parameters:**

-   `metroServerPort` (number): The port number of the Metro server (default: 8081)

**Returns:** Array of connected app objects with WebSocket debugger URLs.

### `readConsoleLogsFromApp`

Reads console logs from a connected React Native application through the Chrome DevTools Protocol.

**Parameters:**

-   `app` (object): App object returned by `getConnectedApps`
-   `maxLogs` (number, optional): Maximum number of logs to return (default: 100)

**Returns:** Array of console messages with complete formatting and content.

## 📋 Example Usage

1. **Get connected apps:**

    ```
    Call getConnectedApps with metroServerPort: 8081
    ```

2. **Read console logs:**
    ```
    Call readConsoleLogsFromApp with the app object and desired maxLogs
    ```
