import {
	createDefaultImport,
	defineCollection,
	defineConfig,
} from "@content-collections/core";
import type { ComponentType } from "react";
import { z } from "zod";

function calculateReadingTime(content: string): number {
	const text = content
		.replace(/^---[\s\S]*?---/, "")
		.replace(/^import\s+.*$/gm, "");

	const codeBlocks = text.match(/```[\s\S]*?```/g) || [];
	const codeLines = codeBlocks.reduce(
		(sum, block) => sum + block.split("\n").length - 2,
		0,
	);

	const prose = text
		.replace(/```[\s\S]*?```/g, "")
		.replace(/<(Demo|Video)[\s\S]*?\/>/g, "");

	const images = (prose.match(/!\[.*?\]\(.*?\)/g) || []).length;
	const xposts = (prose.match(/<XPost\s/g) || []).length;
	const embeds = (prose.match(/<LinkEmbed\s/g) || []).length;

	const words = prose
		.replace(/<[^>]+>/g, "")
		.split(/\s+/)
		.filter(Boolean).length;

	let imageSeconds = 0;
	for (let i = 0; i < images; i++) {
		imageSeconds += Math.max(3, 12 - i);
	}

	const seconds =
		(words / 250) * 60 +
		codeLines * 5 +
		imageSeconds +
		xposts * 10 +
		embeds * 8;

	return Math.max(1, Math.ceil(seconds / 60));
}

const posts = defineCollection({
	name: "posts",
	directory: "src/content/posts",
	include: "**/*.mdx",
	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z.string(),
		draft: z.boolean().optional(),
		content: z.string(),
	}),
	transform: (doc) => {
		const readingTime = calculateReadingTime(doc.content);
		const Content = createDefaultImport<ComponentType>(
			`@/content/posts/${doc._meta.filePath}`,
		);
		return {
			...doc,
			slug: doc._meta.path,
			readingTime,
			Content,
		};
	},
});

const works = defineCollection({
	name: "works",
	directory: "src/content/works",
	include: "**/*.mdx",
	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z.string(),
		type: z.enum(["project", "design", "experiment"]),
		cover: z.string().optional(),
		stack: z.array(z.string()).optional(),
		links: z
			.object({
				live: z.string().optional(),
				github: z.string().optional(),
			})
			.optional(),
		draft: z.boolean().optional(),
		featured: z.boolean().optional(),
		content: z.string(),
	}),
	transform: (doc) => {
		const Content = createDefaultImport<ComponentType>(
			`@/content/works/${doc._meta.filePath}`,
		);
		return {
			...doc,
			slug: doc._meta.path,
			Content,
		};
	},
});

const pages = defineCollection({
	name: "pages",
	directory: "src/content/pages",
	include: "**/*.mdx",
	schema: z.object({
		title: z.string(),
		description: z.string(),
		content: z.string(),
	}),
	transform: (doc) => ({
		...doc,
		slug: doc._meta.path,
	}),
});

export default defineConfig({
	collections: [posts, works, pages],
});
