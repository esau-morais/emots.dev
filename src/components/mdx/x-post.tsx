"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { useRef } from "react";
import { XIcon } from "@/components/icons";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

type XPostProps = { url: string };

type OEmbedResponse = {
	author_name: string;
	author_url: string;
	html: string;
	url: string;
};

const fetchTweetData = createServerFn({ method: "GET" })
	.inputValidator((d: string) => d)
	.handler(async ({ data: url }: { data: string }) => {
		const endpoint = `https://publish.x.com/oembed?url=${encodeURIComponent(url)}&omit_script=1&dnt=1`;
		const res = await fetch(endpoint);
		if (!res.ok) return null;
		return res.json() as Promise<OEmbedResponse>;
	});

const tweetQueryOptions = (url: string, enabled: boolean) =>
	queryOptions({
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

	return (
		<a
			href={data.url}
			target="_blank"
			rel="noopener noreferrer"
			className="group my-6 block border border-gray-800 bg-black p-4 transition-colors hover:border-gray-700 focus:outline-none focus-visible:border-gray-700"
			data-narration-skip
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
	);
}
