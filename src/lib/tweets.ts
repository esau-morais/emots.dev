import { createServerFn } from "@tanstack/react-start";

export type TweetData = {
	author_name: string;
	author_url: string;
	html: string;
	url: string;
};

export type TweetResult = {
	url: string;
	data: TweetData | null;
};

export const fetchTweet = createServerFn({ method: "GET" })
	.inputValidator((url: string) => url)
	.handler(async ({ data: url }: { data: string }) => {
		const endpoint = `https://publish.x.com/oembed?url=${encodeURIComponent(url)}&omit_script=1&dnt=1`;
		const res = await fetch(endpoint);
		if (!res.ok) return null;
		return res.json() as Promise<TweetData>;
	});

export function extractXPostUrls(content: string): string[] {
	const regex = /<XPost\s+url=["']([^"']+)["']\s*\/>/g;
	return [...content.matchAll(regex)].map((match) => match[1]);
}

export async function fetchTweets(urls: string[]): Promise<TweetResult[]> {
	return Promise.all(
		urls.map(async (url) => ({
			url,
			data: await fetchTweet({ data: url }),
		})),
	);
}
