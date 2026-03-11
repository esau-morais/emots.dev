"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { useRef } from "react";
import { XIcon } from "@/components/icons";
import { BlurImage } from "@/components/mdx/blur-image";
import { Video } from "@/components/mdx/video";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

type XPostProps = { url: string };

type OEmbedResponse = {
	author_name: string;
	author_url: string;
	html: string;
	url: string;
};

type MediaVariant = {
	content_type: string;
	bitrate?: number;
	url: string;
};

type MediaDetail = {
	type: "video" | "photo";
	media_url_https: string;
	video_info?: { variants: MediaVariant[] };
};

type TweetData = OEmbedResponse & { media: MediaDetail[] };

function extractTweetId(url: string): string | null {
	return url.match(/status\/(\d+)/)?.[1] ?? null;
}

function bestMp4(variants: MediaVariant[]): string | null {
	const mp4s = variants
		.filter((v) => v.content_type === "video/mp4")
		.sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0));
	return mp4s[0]?.url ?? null;
}

const fetchTweetData = createServerFn({ method: "GET" })
	.inputValidator((d: string) => d)
	.handler(async ({ data: url }: { data: string }) => {
		const id = extractTweetId(url);

		const [oembedRes, syndicationRes] = await Promise.all([
			fetch(
				`https://publish.x.com/oembed?url=${encodeURIComponent(url)}&omit_script=1&dnt=1`,
			),
			id
				? fetch(
						`https://cdn.syndication.twimg.com/tweet-result?id=${id}&lang=en&token=0`,
					)
				: Promise.resolve(null),
		]);

		if (!oembedRes.ok) return null;
		const oembed = (await oembedRes.json()) as OEmbedResponse;

		let media: MediaDetail[] = [];
		if (syndicationRes?.ok) {
			const syndication = (await syndicationRes.json()) as {
				mediaDetails?: MediaDetail[];
			};
			media = syndication.mediaDetails ?? [];
		}

		return { ...oembed, media } as TweetData;
	});

const tweetQueryOptions = (url: string, enabled: boolean) =>
	queryOptions<TweetData | null>({
		queryKey: ["tweet", url],
		queryFn: () => fetchTweetData({ data: url }),
		staleTime: 1000 * 60 * 60 * 24,
		gcTime: 1000 * 60 * 60 * 24,
		enabled,
	});

function extractText(html: string): string {
	const match = html.match(/<p[^>]*>([\s\S]*?)<\/p>/);
	if (!match) return "";
	return match[1]
		.replace(/<br\s*\/?>/gi, "\n")
		.replace(/<a[^>]*>(.*?)<\/a>/gi, "$1")
		.replace(/<[^>]+>/g, "")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.trim();
}

function extractDate(html: string): string | null {
	const matches = [...html.matchAll(/<a[^>]*>([^<]+)<\/a>/gi)];
	const last = matches[matches.length - 1];
	return last ? last[1].trim() : null;
}

function getAvatarUrl(handle: string): string {
	return `https://unavatar.io/x/${handle}`;
}

function TweetSkeleton() {
	return (
		<div
			className="my-6 block border border-gray-800 bg-black p-4 animate-pulse"
			data-narration-skip
		>
			<div className="flex items-start justify-between">
				<div className="flex items-center gap-3">
					<div className="size-10 bg-gray-800" />
					<div className="flex flex-col gap-1">
						<div className="h-4 w-24 bg-gray-800" />
						<div className="h-3 w-16 bg-gray-800" />
					</div>
				</div>
				<XIcon size={20} className="text-gray-700" />
			</div>
			<div className="mt-3 space-y-2">
				<div className="h-4 w-full bg-gray-800" />
				<div className="h-4 w-3/4 bg-gray-800" />
			</div>
			<div className="mt-3 h-3 w-20 bg-gray-800" />
		</div>
	);
}

export function XPost({ url }: XPostProps) {
	const ref = useRef<HTMLDivElement>(null);
	const entry = useIntersectionObserver(ref, {
		rootMargin: "400px",
		freezeOnceVisible: true,
	});
	const inView = entry?.isIntersecting ?? false;

	const { data, isLoading } = useQuery(tweetQueryOptions(url, inView));
	const handle = url.match(/x\.com\/([^/]+)/)?.[1] ?? "";

	if (!inView || isLoading) {
		return (
			<div ref={ref}>
				<TweetSkeleton />
			</div>
		);
	}

	if (!data) {
		return (
			<a
				href={url}
				target="_blank"
				rel="noopener noreferrer"
				className="my-6 flex items-center gap-2 text-sm text-gray-400 underline underline-offset-4 transition-colors hover:text-white focus:outline-none focus-visible:text-white"
				data-narration-skip
			>
				View post on <XIcon size={14} aria-label="X" />
			</a>
		);
	}

	const text = extractText(data.html);
	const date = extractDate(data.html);
	const authorHandle = data.author_url.split("/").pop() ?? handle;

	const firstMedia = data.media?.[0];
	const rawVideoSrc =
		firstMedia?.type === "video" && firstMedia.video_info
			? bestMp4(firstMedia.video_info.variants)
			: null;
	const videoSrc = rawVideoSrc
		? `/api/media/tweet-video?url=${encodeURIComponent(rawVideoSrc)}`
		: null;
	const photoSrc =
		firstMedia?.type === "photo" ? firstMedia.media_url_https : null;
	const thumbnail = firstMedia?.media_url_https ?? undefined;

	return (
		<div
			className="my-6 border border-gray-800 bg-black transition-colors hover:border-gray-700"
			data-narration-skip
		>
			<a
				href={data.url}
				target="_blank"
				rel="noopener noreferrer"
				className="block p-4 focus:outline-none focus-visible:outline-none"
			>
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-3">
						<img
							src={getAvatarUrl(authorHandle)}
							alt=""
							className="size-10 bg-gray-800"
							loading="lazy"
						/>
						<div className="flex flex-col">
							<span className="font-semibold leading-tight text-white">
								{data.author_name}
							</span>
							<span className="text-sm leading-tight text-gray-500">
								@{authorHandle}
							</span>
						</div>
					</div>
					<XIcon size={20} className="text-white" />
				</div>

				<p className="mt-3 whitespace-pre-line text-[15px] leading-normal text-white">
					{text}
				</p>

				{date && <p className="mt-3 text-sm text-gray-500">{date}</p>}
			</a>

			{videoSrc && (
				<div className="border-t border-gray-800 [&>figure]:my-0 [&>figure]:border-0">
					<Video src={videoSrc} poster={thumbnail ?? ""} />
				</div>
			)}

			{photoSrc && !videoSrc && (
				<div className="border-t border-gray-800 [&>span]:my-0 [&>span]:border-0">
					<BlurImage src={photoSrc} alt="" />
				</div>
			)}
		</div>
	);
}
