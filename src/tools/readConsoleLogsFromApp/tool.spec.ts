import { describe, expect, it } from 'bun:test';
import { readConsoleLogsFromApp, formatConsoleArgument } from './tool';

describe('formatConsoleArgument', () => {
	it('should handle undefined values', () => {
		const arg = { type: 'undefined' as const };
		expect(formatConsoleArgument(arg)).toBe('undefined');
	});

	it('should handle null values', () => {
		const arg = { type: 'object' as const, subtype: 'null' as const };
		expect(formatConsoleArgument(arg)).toBe('null');
	});

	it('should use description for multi-line strings', () => {
		const arg = {
			type: 'string' as const,
			value: 'Line 1',
			description: 'Line 1\nLine 2\nLine 3',
		};
		expect(formatConsoleArgument(arg)).toBe('Line 1\nLine 2\nLine 3');
	});

	it('should use description for objects', () => {
		const arg = {
			type: 'object' as const,
			description: "{user: {name: 'John', age: 30}}",
		};
		expect(formatConsoleArgument(arg)).toBe("{user: {name: 'John', age: 30}}");
	});

	it('should use description for arrays', () => {
		const arg = {
			type: 'object' as const,
			subtype: 'array' as const,
			description: "[1, 2, 3, 'hello']",
		};
		expect(formatConsoleArgument(arg)).toBe("[1, 2, 3, 'hello']");
	});

	it('should fall back to value for simple primitives', () => {
		const stringArg = { type: 'string' as const, value: 'hello' };
		expect(formatConsoleArgument(stringArg)).toBe('hello');

		const numberArg = { type: 'number' as const, value: 42 };
		expect(formatConsoleArgument(numberArg)).toBe('42');

		const booleanArg = { type: 'boolean' as const, value: true };
		expect(formatConsoleArgument(booleanArg)).toBe('true');
	});

	it('should handle unserializable values', () => {
		const nanArg = { type: 'number' as const, unserializableValue: 'NaN' };
		expect(formatConsoleArgument(nanArg)).toBe('NaN');

		const infinityArg = {
			type: 'number' as const,
			unserializableValue: 'Infinity',
		};
		expect(formatConsoleArgument(infinityArg)).toBe('Infinity');
	});

	it('should show type as fallback', () => {
		const functionArg = { type: 'function' as const };
		expect(formatConsoleArgument(functionArg)).toBe('[function]');

		const errorArg = { type: 'object' as const, subtype: 'error' as const };
		expect(formatConsoleArgument(errorArg)).toBe('[object error]');
	});

	it('should handle complex nested objects', () => {
		const arg = {
			type: 'object' as const,
			description:
				"{\n  user: {\n    name: 'John',\n    details: {\n      age: 30,\n      city: 'New York'\n    }\n  }\n}",
		};
		expect(formatConsoleArgument(arg)).toBe(
			"{\n  user: {\n    name: 'John',\n    details: {\n      age: 30,\n      city: 'New York'\n    }\n  }\n}",
		);
	});
});

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
