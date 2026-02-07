import { server as env } from "@/lib/env/server";

const API_BASE = "https://api.raindrop.io/rest/v1";
const PER_PAGE = 50;

function headers() {
	return {
		Authorization: `Bearer ${env.RAINDROP_ACCESS_TOKEN}`,
		"Content-Type": "application/json",
	};
}

export type RaindropCollection = {
	_id: number;
	title: string;
	count: number;
	slug: string;
};

type GetCollectionsOptions = {
	includeEmpty?: boolean;
};

export type RaindropItem = {
	_id: number;
	title: string;
	link: string;
	domain: string;
	cover: string;
	excerpt: string;
	note: string;
	created: string;
	lastUpdate: string;
	tags: string[];
	type: string;
};

type CollectionsResponse = {
	result: boolean;
	items: Array<{
		_id: number;
		title: string;
		count: number;
		public: boolean;
	}>;
};

type RaindropsResponse = {
	result: boolean;
	items: RaindropItem[];
	count: number;
};

function slugify(title: string): string {
	return title
		.toLowerCase()
		.replace(/&/g, "and")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");
}

export async function getCollections(
	options: GetCollectionsOptions = {},
): Promise<RaindropCollection[]> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 10_000);

	try {
		const res = await fetch(`${API_BASE}/collections`, {
			headers: headers(),
			signal: controller.signal,
		});

		if (!res.ok) throw new Error(`Raindrop collections: ${res.status}`);

		const data = (await res.json()) as CollectionsResponse;

		return data.items
			.filter((c) => options.includeEmpty || c.count > 0)
			.map((c) => ({
				_id: c._id,
				title: c.title,
				count: c.count,
				slug: slugify(c.title),
			}))
			.sort((a, b) => a.title.localeCompare(b.title));
	} finally {
		clearTimeout(timeout);
	}
}

export async function getRaindrops(
	collectionId: number,
	page = 0,
	perPage = PER_PAGE,
): Promise<{ items: RaindropItem[]; totalCount: number }> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 10_000);

	try {
		const params = new URLSearchParams({
			sort: "-created",
			perpage: String(perPage),
			page: String(page),
		});

		const res = await fetch(`${API_BASE}/raindrops/${collectionId}?${params}`, {
			headers: headers(),
			signal: controller.signal,
		});

		if (!res.ok) throw new Error(`Raindrop items: ${res.status}`);

		const data = (await res.json()) as RaindropsResponse;
		return { items: data.items, totalCount: data.count };
	} finally {
		clearTimeout(timeout);
	}
}

export async function createRaindrop(options: {
	link: string;
	title: string;
	excerpt: string;
	collectionId: number;
	note?: string;
}): Promise<boolean> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 10_000);

	try {
		const res = await fetch(`${API_BASE}/raindrop`, {
			method: "POST",
			headers: headers(),
			signal: controller.signal,
			body: JSON.stringify({
				link: options.link,
				title: options.title,
				excerpt: options.excerpt,
				collection: { $id: options.collectionId },
				note: options.note ?? "",
			}),
		});

		return res.ok;
	} finally {
		clearTimeout(timeout);
	}
}

export type SignatureData =
	| { type: "draw"; paths: string[] }
	| { type: "text"; value: string }
	| { type: "anonymous" }
	| null;

export function encodeSignatureForNote(signature: SignatureData): string {
	if (!signature) return '<!-- sig:{"type":"anonymous"} -->';
	return `<!-- sig:${JSON.stringify(signature)} -->`;
}

export function decodeSignatureFromNote(note: string): SignatureData {
	const match = note.match(/<!-- sig:(.*?) -->/);
	if (!match?.[1]) return null;

	try {
		const parsed = JSON.parse(match[1]) as unknown;
		if (!parsed || typeof parsed !== "object") return null;
		if (!("type" in parsed) || typeof parsed.type !== "string") return null;

		if (parsed.type === "anonymous") {
			return { type: "anonymous" };
		}

		if (
			parsed.type === "text" &&
			"value" in parsed &&
			typeof parsed.value === "string"
		) {
			return { type: "text", value: parsed.value };
		}

		if (
			parsed.type === "draw" &&
			"paths" in parsed &&
			Array.isArray(parsed.paths) &&
			parsed.paths.every((path) => typeof path === "string")
		) {
			return { type: "draw", paths: parsed.paths };
		}

		return null;
	} catch {
		return null;
	}
}
