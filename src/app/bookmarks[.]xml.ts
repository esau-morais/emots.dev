import { createFileRoute } from "@tanstack/react-router";
import { getCollections, getRaindrops } from "@/lib/raindrop";
import { url as siteUrl } from "@/utils/consts";

export const Route = createFileRoute("/bookmarks.xml")({
	server: {
		handlers: {
			GET: async () => {
				const collections = await getCollections();

				const results = await Promise.all(
					collections.map(async (collection) => {
						const { items } = await getRaindrops(collection._id, 0);
						return items.slice(0, 10).map((item) => ({
							title: item.title,
							link: item.link,
							description: item.excerpt || "",
							date: item.lastUpdate || item.created,
							category: collection.title,
						}));
					}),
				);
				const allItems = results.flat();

				allItems.sort(
					(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
				);

				const escapeXml = (s: string) =>
					s
						.replace(/&/g, "&amp;")
						.replace(/</g, "&lt;")
						.replace(/>/g, "&gt;")
						.replace(/"/g, "&quot;");

				const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>emots.dev bookmarks</title>
  <link>${siteUrl}/bookmarks</link>
  <description>links i find useful or interesting</description>
  <atom:link href="${siteUrl}/bookmarks.xml" rel="self" type="application/rss+xml"/>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${allItems
	.map(
		(item) => `  <item>
    <title>${escapeXml(item.title)}</title>
    <link>${escapeXml(item.link)}</link>
    <description>${escapeXml(item.description)}</description>
    <category>${escapeXml(item.category)}</category>
    <pubDate>${new Date(item.date).toUTCString()}</pubDate>
    <guid>${escapeXml(item.link)}</guid>
  </item>`,
	)
	.join("\n")}
</channel>
</rss>`;

				return new Response(xml, {
					headers: {
						"Content-Type": "application/rss+xml;charset=utf-8",
						"Cache-Control": "public, max-age=3600",
					},
				});
			},
		},
	},
});
