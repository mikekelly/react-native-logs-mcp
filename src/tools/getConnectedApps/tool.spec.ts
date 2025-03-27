import { describe, expect, it, beforeEach, mock } from 'bun:test';
import { getConnectedAppsTool } from './tool';
import type { InspectorApp } from '@/types';

const mockApps: InspectorApp[] = [
	{
		id: 'test-app-1',
		description: 'Test App 1',
		deviceName: 'Test Device 1',
		webSocketDebuggerUrl:
			'ws://localhost:8081/debugger-proxy?role=debugger&targetId=test-app-1',
		title: 'Test App 1',
		type: 'app',
		devtoolsFrontendUrl:
			'chrome-devtools://devtools/bundled/inspector.html?ws=localhost:8081/debugger-proxy&targetId=test-app-1',
		reactNative: {
			logicalDeviceId: 'device-1',
			capabilities: {
				prefersFuseboxFrontend: true,
				nativeSourceCodeFetching: false,
				nativePageReloads: true,
			},
		},
	},
	{
		id: 'test-app-2',
		description: 'Test App 2',
		deviceName: 'Test Device 2',
		webSocketDebuggerUrl:
			'ws://localhost:8081/debugger-proxy?role=debugger&targetId=test-app-2',
		title: 'Test App 2',
		type: 'app',
		devtoolsFrontendUrl:
			'chrome-devtools://devtools/bundled/inspector.html?ws=localhost:8081/debugger-proxy&targetId=test-app-2',
		reactNative: {
			logicalDeviceId: 'device-2',
			capabilities: {
				prefersFuseboxFrontend: true,
				nativeSourceCodeFetching: false,
				nativePageReloads: true,
			},
		},
	},
];

describe('getConnectedAppsTool', () => {
	beforeEach(() => {
		// Reset all mocks before each test
		mock.restore();
	});

	it('should return connected apps when Metro server is running', async () => {
		// Mock the module to return our mock data
		mock.module(
			'@expo/cli/build/src/start/server/middleware/inspector/JsInspector',
			() => ({
				queryAllInspectorAppsAsync: async () => mockApps,
			}),
		);

		const result = await getConnectedAppsTool.handler({
			metroServerPort: 8081,
		});

		expect(result.content).toHaveLength(2); // Expect two messages, one for each app
		expect(result.content[0].type).toBe('text');
		expect(result.content[1].type).toBe('text');

		const firstApp = JSON.parse(result.content[0].text as string);
		const secondApp = JSON.parse(result.content[1].text as string);

		expect(firstApp).toEqual({
			id: mockApps[0].id,
			description: mockApps[0].description,
			deviceName: mockApps[0].deviceName,
			webSocketDebuggerUrl: mockApps[0].webSocketDebuggerUrl,
			title: mockApps[0].title,
			type: mockApps[0].type,
			devtoolsFrontendUrl: mockApps[0].devtoolsFrontendUrl,
			reactNative: mockApps[0].reactNative,
		});

		expect(secondApp).toEqual({
			id: mockApps[1].id,
			description: mockApps[1].description,
			deviceName: mockApps[1].deviceName,
			webSocketDebuggerUrl: mockApps[1].webSocketDebuggerUrl,
			title: mockApps[1].title,
			type: mockApps[1].type,
			devtoolsFrontendUrl: mockApps[1].devtoolsFrontendUrl,
			reactNative: mockApps[1].reactNative,
		});
	});

	it('should handle case when no apps are connected', async () => {
		// Mock the module to return an empty array
		mock.module(
			'@expo/cli/build/src/start/server/middleware/inspector/JsInspector',
			() => ({
				queryAllInspectorAppsAsync: async () => [],
			}),
		);

		const result = await getConnectedAppsTool.handler({
			metroServerPort: 8081,
		});

		expect(result.content).toHaveLength(1);
		expect(result.content[0].type).toBe('text');
		expect(result.content[0].text).toContain('No connected apps found');
		expect(result.isError).toBe(true);
	});

	it('should handle errors when Metro server is not running', async () => {
		const error = new Error('Connection refused');
		// Mock the module to throw an error
		mock.module(
			'@expo/cli/build/src/start/server/middleware/inspector/JsInspector',
			() => ({
				queryAllInspectorAppsAsync: async () => {
					throw error;
				},
			}),
		);

		const result = await getConnectedAppsTool.handler({
			metroServerPort: 8081,
		});

		expect(result.content).toHaveLength(1);
		expect(result.content[0].type).toBe('text');
		expect(result.content[0].text).toContain('Error: Connection refused');
		expect(result.isError).toBe(true);
	});

	it('should validate input schema', () => {
		const schema = getConnectedAppsTool.inputSchema;
		expect(schema).toBeDefined();
		const properties = schema.properties as {
			metroServerPort: { type: string };
		};
		expect(properties).toHaveProperty('metroServerPort');
		expect(properties.metroServerPort.type).toBe('number');
	});
});
