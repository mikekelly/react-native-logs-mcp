import WebSocket from 'ws';
import type { ToolRegistration } from '@/types';
import { makeJsonSchema } from '@/utils/makeJsonSchema';
import {
	type ReadConsoleLogsFromAppSchema,
	readConsoleLogsFromAppSchema,
} from './schema';

interface ConsoleMessage {
	type: string;
	text: string;
	level: string;
	timestamp: number;
}

const UNSUPPORTED_CLIENT_MESSAGE =
	'You are using an unsupported debugging client. Use the Dev Menu in your app (or type `j` in the Metro terminal) to open React Native DevTools.';

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
					const args = message.params.args || [];
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
					const text = args.map((arg: any) => arg.value || '').join(' ');

					// Skip the unsupported client message
					if (text.includes(UNSUPPORTED_CLIENT_MESSAGE)) {
						return;
					}

					const logMessage: ConsoleMessage = {
						type: message.params.type || 'log',
						text,
						level: message.params.type || 'log',
						timestamp: Date.now(),
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

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(logs, null, 2),
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
