import { describe, expect, it } from 'bun:test';
import { readConsoleLogsFromApp } from './tool';

describe('readConsoleLogsFromApp', () => {
	it('should connect to Metro server and read logs', async () => {
		// First get the connected apps
		const metroServerOrigin = 'http://localhost:8081';
		const response = await fetch(`${metroServerOrigin}/json/list`);
		const apps = await response.json();

		if (!apps || apps.length === 0) {
			throw new Error(
				'No connected apps found. Please ensure Metro is running and a React Native app is connected.',
			);
		}

		console.log('Found connected apps:', JSON.stringify(apps, null, 2));

		// Use the first connected app
		const app = apps[0];
		console.log('Using app:', JSON.stringify(app, null, 2));

		const logs = await readConsoleLogsFromApp(app, 5);
		console.log('Received logs:', JSON.stringify(logs, null, 2));

		expect(Array.isArray(logs)).toBe(true);
	}, 10000); // 10 second timeout
});
