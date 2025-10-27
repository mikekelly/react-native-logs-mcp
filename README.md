# React Native Debugger MCP

An MCP server that connects to your React Native application debugger via the Chrome DevTools Protocol.

**This fork** is optimized to minimize AI context usage by reducing verbose output. Console logs are returned as plain text rather than JSON, and stack traces are only included for errors and warnings.

## ✨ Key Features

-   **Token-Efficient Output**: Console logs are formatted as plain text (one per line) instead of verbose JSON, reducing context usage by ~98%
-   **Smart Stack Traces**: Full stack traces are only included for errors and warnings, not for regular log messages
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
			"args": ["-y", "github:mikekelly/react-native-debugger-mcp"]
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

**Returns:** Plain text console output with one log per line. Errors and warnings are prefixed with ❌ ERROR: or ⚠️ WARNING: and include the top stack frame for context.

## 📋 Example Usage

1. **Get connected apps:**

    ```
    Call getConnectedApps with metroServerPort: 8081
    ```

2. **Read console logs:**
    ```
    Call readConsoleLogsFromApp with the app object and desired maxLogs
    ```
