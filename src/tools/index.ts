import type { ToolRegistration } from '@/types';
// import { someFunctionTool } from "./exampleTool";
import { getConnectedAppsTool } from './getConnectedApps/tool';
import { readConsoleLogsFromAppTool } from './readConsoleLogsFromApp/tool';

// biome-ignore lint/suspicious/noExplicitAny: Any is fine here because all tools validate their input schemas.
export const createTools = (): ToolRegistration<any>[] => {
	return [
		{
			...getConnectedAppsTool,
			// biome-ignore lint/suspicious/noExplicitAny: All tools validate their input schemas, so any is fine.
			handler: (args: any) => getConnectedAppsTool.handler(args),
		},
		{
			...readConsoleLogsFromAppTool,
			// biome-ignore lint/suspicious/noExplicitAny: All tools validate their input schemas, so any is fine.
			handler: (args: any) => readConsoleLogsFromAppTool.handler(args),
		},
	];
};

export const tools = [
	readConsoleLogsFromAppTool,
	getConnectedAppsTool,
] as const;
