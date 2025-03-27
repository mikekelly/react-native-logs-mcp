import * as z from 'zod';

export const getConnectedAppsSchema = z.object({
	metroServerPort: z.number().describe('The port number of the Metro server'),
});

export type GetConnectedAppsSchema = z.infer<typeof getConnectedAppsSchema>;
