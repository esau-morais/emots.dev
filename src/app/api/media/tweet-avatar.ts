import { createFileRoute } from "@tanstack/react-router";

const ALLOWED_HOST = "pbs.twimg.com";

export const Route = createFileRoute("/api/media/tweet-avatar")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const { searchParams } = new URL(request.url);
				const avatarUrl = searchParams.get("url");

				if (!avatarUrl) {
					return new Response("Missing url parameter", { status: 400 });
				}

				let parsed: URL;
				try {
					parsed = new URL(avatarUrl);
				} catch {
					return new Response("Invalid url", { status: 400 });
				}

				if (parsed.hostname !== ALLOWED_HOST) {
					return new Response("Forbidden", { status: 403 });
				}

				const upstream = await fetch(avatarUrl, {
					headers: {
						Referer: "https://twitter.com",
						"User-Agent": "Mozilla/5.0 (compatible; emots.dev/1.0)",
					},
				});

				if (!upstream.ok) {
					return new Response("Failed to fetch avatar", {
						status: upstream.status,
					});
				}

				return new Response(upstream.body, {
					headers: {
						"Content-Type":
							upstream.headers.get("Content-Type") ?? "image/jpeg",
						"Cache-Control": "public, max-age=604800, immutable",
					},
				});
			},
		},
	},
});
