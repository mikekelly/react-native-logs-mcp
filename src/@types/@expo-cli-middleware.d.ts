declare module '@expo/cli/build/src/start/server/middleware/inspector/JsInspector' {
	export function queryAllInspectorAppsAsync(
		metroServerOrigin: string,
	): Promise<MetroInspectorProxyApp[]>;
}
