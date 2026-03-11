import { createFileRoute } from "@tanstack/react-router";

const ALLOWED_HOST = "video.twimg.com";

export const Route = createFileRoute("/api/media/tweet-video")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const { searchParams } = new URL(request.url);
				const videoUrl = searchParams.get("url");

				if (!videoUrl) {
					return new Response("Missing url parameter", { status: 400 });
				}

				let parsed: URL;
				try {
					parsed = new URL(videoUrl);
				} catch {
					return new Response("Invalid url", { status: 400 });
				}

				if (parsed.hostname !== ALLOWED_HOST) {
					return new Response("Forbidden", { status: 403 });
				}

				const upstream = await fetch(videoUrl, {
					headers: {
						Referer: "https://twitter.com",
						"User-Agent": "Mozilla/5.0 (compatible; emots.dev/1.0)",
					},
				});

				if (!upstream.ok) {
					return new Response("Failed to fetch video", {
						status: upstream.status,
					});
				}

				return new Response(upstream.body, {
					headers: {
						"Content-Type": upstream.headers.get("Content-Type") ?? "video/mp4",
						"Cache-Control": "public, max-age=604800, immutable",
						"Accept-Ranges": "bytes",
					},
				});
			},
		},
	},
});
