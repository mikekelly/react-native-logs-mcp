import WebSocket from 'ws';
import type { ToolRegistration } from '@/types';
import { makeJsonSchema } from '@/utils/makeJsonSchema';
import {
	type ReadConsoleLogsFromAppSchema,
	readConsoleLogsFromAppSchema,
} from './schema';

// Chrome DevTools Protocol interfaces
interface CallFrame {
	functionName: string;
	scriptId: string;
	url: string;
	lineNumber: number;
	columnNumber: number;
}

interface StackTrace {
	description?: string;
	callFrames: CallFrame[];
	parent?: StackTrace;
}

interface RemoteObject {
	type:
		| 'object'
		| 'function'
		| 'undefined'
		| 'string'
		| 'number'
		| 'boolean'
		| 'symbol'
		| 'bigint';
	subtype?:
		| 'array'
		| 'null'
		| 'node'
		| 'regexp'
		| 'date'
		| 'map'
		| 'set'
		| 'weakmap'
		| 'weakset'
		| 'iterator'
		| 'generator'
		| 'error'
		| 'proxy'
		| 'promise'
		| 'typedarray'
		| 'arraybuffer'
		| 'dataview';
	className?: string;
	value?: any;
	unserializableValue?: string;
	description?: string;
	objectId?: string;
}

interface ConsoleMessage {
	type: string;
	text: string;
	level: string;
	timestamp: number;
	args?: RemoteObject[]; // Raw arguments for advanced processing
	stackTrace?: StackTrace; // Stack trace if available
}

const UNSUPPORTED_CLIENT_MESSAGE =
	'You are using an unsupported debugging client. Use the Dev Menu in your app (or type `j` in the Metro terminal) to open React Native DevTools.';

/**
 * Formats a Chrome DevTools Protocol RemoteObject into a readable string representation.
 * This function handles the full range of console argument types including multi-line strings,
 * objects, arrays, and complex data structures.
 */
export function formatConsoleArgument(arg: RemoteObject): string {
	// Handle null and undefined explicitly
	if (arg.type === 'undefined') {
		return 'undefined';
	}
	if (arg.subtype === 'null') {
		return 'null';
	}

	// Use description for complex objects and formatted representations
	// The description field contains the complete, properly formatted representation
	// including multi-line strings, object structures, arrays, etc.
	if (arg.description !== undefined) {
		return arg.description;
	}

	// Fall back to value for simple primitives
	if (arg.value !== undefined) {
		return String(arg.value);
	}

	// Handle unserializable values (NaN, Infinity, etc.)
	if (arg.unserializableValue !== undefined) {
		return arg.unserializableValue;
	}

	// Final fallback - show the type
	return `[${arg.type}${arg.subtype ? ` ${arg.subtype}` : ''}]`;
}

export const readConsoleLogsFromApp = async (
	app: { id: string; description: string; webSocketDebuggerUrl: string },
	maxLogs = 100,
): Promise<ConsoleMessage[]> => {
	return new Promise((resolve, reject) => {
		const ws = new WebSocket(app.webSocketDebuggerUrl);
		const logs: ConsoleMessage[] = [];
		let messageId = 1;

		ws.on('open', () => {
			// Enable runtime
			const enableRuntimeMessage = {
				id: messageId++,
				method: 'Runtime.enable',
			};
			ws.send(JSON.stringify(enableRuntimeMessage));
		});

		ws.on('message', (data: string) => {
			try {
				const message = JSON.parse(data);

				// Handle console messages
				if (message.method === 'Runtime.consoleAPICalled') {
					const args: RemoteObject[] = message.params.args || [];
					// Use enhanced formatting to capture full console output including multi-line content
					const text = args.map(formatConsoleArgument).join(' ');

					// Skip the unsupported client message
					if (text.includes(UNSUPPORTED_CLIENT_MESSAGE)) {
						return;
					}

					const level = message.params.type || 'log';
					const isErrorOrWarning = level === 'error' || level === 'warning';

					const logMessage: ConsoleMessage = {
						type: level,
						text,
						level,
						timestamp: Date.now(),
						// Only include args and stackTrace for errors and warnings
						...(isErrorOrWarning && {
							args,
							stackTrace: message.params.stackTrace,
						}),
					};
					logs.push(logMessage);

					// Close connection when we have enough logs
					if (logs.length >= maxLogs) {
						ws.close();
					}
				}
			} catch (error) {
				// @TODO Handle this better
				// console.error('Error parsing WebSocket message:', error);
			}
		});

		ws.on('close', () => {
			resolve(logs);
		});

		ws.on('error', (error) => {
			reject(error);
		});

		// Set a timeout to close the connection if it takes too long
		setTimeout(() => {
			if (ws.readyState === WebSocket.OPEN) {
				ws.close();
			}
			resolve(logs);
		}, 5000);
	});
};

export const readConsoleLogsFromAppTool: ToolRegistration<ReadConsoleLogsFromAppSchema> =
	{
		name: 'readConsoleLogsFromApp',
		description:
			'Reads console logs from a connected React Native app through the debugger WebSocket',
		inputSchema: makeJsonSchema(readConsoleLogsFromAppSchema),
		handler: async ({ app, maxLogs }: ReadConsoleLogsFromAppSchema) => {
			try {
			const parsedArgs = readConsoleLogsFromAppSchema.parse({ app, maxLogs });
			const logs = await readConsoleLogsFromApp(
				parsedArgs.app,
				parsedArgs.maxLogs,
			);

			// Format logs as plain text, one per line
			// For errors/warnings, include additional context
			const formattedLogs = logs.map(log => {
				const prefix = log.level === 'error' ? '❌ ERROR: ' : 
				               log.level === 'warning' ? '⚠️  WARNING: ' : '';
				let output = `${prefix}${log.text}`;
				
				// For errors and warnings, append stack trace if available
				if ((log.level === 'error' || log.level === 'warning') && log.stackTrace) {
					const topFrame = log.stackTrace.callFrames[0];
					if (topFrame) {
						output += `\n  at ${topFrame.functionName || 'anonymous'} (line ${topFrame.lineNumber})`;
					}
				}
				
				return output;
			}).join('\n');

			return {
				content: [
					{
						type: 'text',
						text: formattedLogs || 'No logs received',
					},
				],
			};
			} catch (error) {
				return {
					content: [
						{
							type: 'text',
							text: `Error: ${(error as Error).message}`,
						},
					],
					isError: true,
				};
			}
		},
	};
