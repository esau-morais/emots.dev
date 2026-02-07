import { createFileRoute } from "@tanstack/react-router";
import { allPosts, allWorks } from "content-collections";
import { url } from "@/utils/consts";

export const Route = createFileRoute("/sitemap.xml")({
	server: {
		handlers: {
			GET: async () => {
				const today = new Date().toISOString().split("T")[0];
				const routes = ["", "/work", "/blog", "/craft", "/bookmarks"];

				const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((r) => `  <url><loc>${url}${r}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
${allWorks
	.filter((w) => !w.draft)
	.map(
		(w) =>
			`  <url><loc>${url}/work/${w.slug}</loc><lastmod>${new Date(w.date).toISOString().split("T")[0]}</lastmod></url>`,
	)
	.join("\n")}
${allPosts
	.filter((p) => !p.draft)
	.map(
		(p) =>
			`  <url><loc>${url}/blog/${p.slug}</loc><lastmod>${new Date(p.date).toISOString().split("T")[0]}</lastmod></url>`,
	)
	.join("\n")}
</urlset>`;

				return new Response(xml, {
					headers: {
						"Content-Type": "application/xml",
						"Cache-Control": "public, max-age=3600",
					},
				});
			},
		},
	},
});
