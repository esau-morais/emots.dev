import { createMiddleware, createStart } from "@tanstack/react-start";
import { allPages, allPosts, allWorks } from "content-collections";
import { client as env } from "@/lib/env";

const PAGE_SLUGS = ["checklist", "craft"] as const;

const REDIRECTS: Record<string, string> = {
	"/links": "https://links.emots.dev",
	"/meet": "https://cal.com/emorais/appointment",
	"/resume": `${env.VITE_R2_URL}/Esau Morais.pdf`,
};

function getContentRaw(
	type: "blog" | "work" | "pages",
	slug: string,
): string | null {
	if (type === "blog") {
		const post = allPosts.find((p) => p.slug === slug);
		return post?.content ?? null;
	}
	if (type === "work") {
		const work = allWorks.find((w) => w.slug === slug);
		return work?.content ?? null;
	}
	if (type === "pages") {
		const page = allPages.find((p) => p.slug === slug);
		return page?.content ?? null;
	}
	return null;
}

const redirectsMiddleware = createMiddleware().server(
	async ({ request, next }) => {
		const url = new URL(request.url);
		const redirect = REDIRECTS[url.pathname];
		if (redirect) {
			return Response.redirect(redirect, 308);
		}
		return next();
	},
);

const contentNegotiationMiddleware = createMiddleware().server(
	async ({ request, next }) => {
		const accept = request.headers.get("accept") || "";
		const wantsHtml = accept.includes("text/html");
		const wantsMarkdown = accept.includes("text/markdown");

		if (wantsMarkdown && !wantsHtml) {
			return next();
		}

		const url = new URL(request.url);
		const pathname = url.pathname;

		let type: "blog" | "work" | "pages" | null = null;
		let slug: string | null = null;

		const blogMatch = pathname.match(/^\/blog\/([^/]+)$/);
		if (blogMatch) {
			type = "blog";
			slug = blogMatch[1];
		}

		const workMatch = pathname.match(/^\/work\/([^/]+)$/);
		if (workMatch) {
			type = "work";
			slug = workMatch[1];
		}

		const pageSlug = pathname.slice(1);
		if (PAGE_SLUGS.includes(pageSlug as (typeof PAGE_SLUGS)[number])) {
			type = "pages";
			slug = pageSlug;
		}

		if (!type || !slug) {
			return next();
		}

		const content = getContentRaw(type, slug);
		if (!content) {
			return new Response("Not found", { status: 404 });
		}

		return new Response(content, {
			headers: {
				"Content-Type": "text/markdown; charset=utf-8",
				"Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
			},
		});
	},
);

export const startInstance = createStart(() => ({
	requestMiddleware: [redirectsMiddleware, contentNegotiationMiddleware],
}));
