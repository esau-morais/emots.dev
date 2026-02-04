import { z } from "zod";

const schema = z.object({
	VITE_BASE_URL: z.string().optional(),
	VITE_R2_URL: z.string().default("https://cdn.emots.dev"),
});

export type ClientEnv = z.infer<typeof schema>;

export const client: ClientEnv = schema.parse(import.meta.env);
