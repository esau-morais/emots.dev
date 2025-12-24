import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		// notion
		NOTION_KEY: z.string().regex(/^secret_[a-zA-Z0-9]{43}$/),
		DATABASE_ID: z.string().regex(/^([0-9a-fA-F]{32})$/),
		// captcha
		SECRET_KEY: z.string(),
		// github contribution api
		GITHUB_TOKEN: z.string(),
	},
	client: {
		NEXT_PUBLIC_CURRENT_COMPANY: z.string().min(1),
	},
	experimental__runtimeEnv: {
		NEXT_PUBLIC_CURRENT_COMPANY: process.env.NEXT_PUBLIC_CURRENT_COMPANY,
	},
});
