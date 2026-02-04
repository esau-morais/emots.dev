import { client as env } from "@/lib/env";

// Environment
export const BASE_URL =
	import.meta.env.MODE !== "development"
		? "https://emots.dev"
		: (env.VITE_BASE_URL ?? "http://localhost:3000");

// SEO-related
export const title = "esaú morais - front-end engineer";
export const description =
	"front-end engineer building what people need. creating unique and easy experiences.";
export const ogImage = `${BASE_URL}/og_image.png`;
export const url = BASE_URL;
