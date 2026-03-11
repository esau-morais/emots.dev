import path from "node:path";
import contentCollections from "@content-collections/vite";
import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	server: { port: 3000 },
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	plugins: [
		contentCollections(),
		tailwindcss(),
		tsconfigPaths(),
		mdx({
			providerImportSource: "@mdx-js/react",
			remarkPlugins: [remarkGfm, remarkFrontmatter, remarkMdxFrontmatter],
			rehypePlugins: [
				rehypeSlug,
				[
					rehypePrettyCode,
					{
						theme: { dark: "vesper", light: "github-light" },
						keepBackground: false,
					},
				],
			],
		}),
		tanstackStart({ srcDirectory: "src", router: { routesDirectory: "app" } }),
		nitro(),
		viteReact({ babel: { plugins: ["babel-plugin-react-compiler"] } }),
	],
});
