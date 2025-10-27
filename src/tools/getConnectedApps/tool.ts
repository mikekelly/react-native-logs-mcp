import { queryAllInspectorAppsAsync } from '@expo/cli/build/src/start/server/middleware/inspector/JsInspector';

import type { ToolRegistration } from '@/types';
import { makeJsonSchema } from '@/utils/makeJsonSchema';
import { type GetConnectedAppsSchema, getConnectedAppsSchema } from './schema';

export const getConnectedAppsTool: ToolRegistration<GetConnectedAppsSchema> = {
	name: 'getConnectedApps',
	description: 'Get the connected apps',
	inputSchema: makeJsonSchema(getConnectedAppsSchema),
	handler: async ({ metroServerPort }: GetConnectedAppsSchema) => {
		const metroServerOrigin = `http://localhost:${metroServerPort}`;
		try {
			const apps = await queryAllInspectorAppsAsync(metroServerOrigin);

			if (!apps || apps.length === 0) {
				throw new Error(
					'No connected apps found, please ensure that Metro is running',
				);
			}

		return {
			content: apps.map((app) => ({
				type: 'text',
				text: JSON.stringify(app, null, 2),
			})),
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
