import { createHash } from "node:crypto";
import { lookup } from "node:dns/promises";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { isIP } from "node:net";
import { initWasm, Resvg } from "@resvg/resvg-wasm";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { compressPaths, compressToken, signToken } from "@/lib/bookmarks-auth";
import { server as env } from "@/lib/env/server";
import type { SignatureData } from "@/lib/raindrop";
import { getCollections } from "@/lib/raindrop";
import { BASE_URL } from "@/utils/consts";

const COORD_RE = /[-+]?\d+(?:\.\d+)?/g;

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const MAX_TRACKED_CLIENTS = 1000;

const URL_DEDUPE_WINDOW_MS = 2 * 60 * 1000;
const MAX_TRACKED_URLS = 2000;

const METADATA_TIMEOUT_MS = 5000;
const WEBHOOK_TIMEOUT_MS = 8000;
const RETRY_BASE_DELAY_MS = 250;
const MAX_METADATA_REDIRECTS = 5;

const require = createRequire(import.meta.url);

const rateLimit = new Map<string, number[]>();
const recentUrls = new Map<string, number>();

let wasmInitPromise: Promise<void> | null = null;

const signatureSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("draw"),
		paths: z.array(z.string().min(1).max(2000)).min(1).max(300),
	}),
	z.object({
		type: z.literal("text"),
		value: z.string().trim().min(1).max(40),
	}),
]);

const submitPayloadSchema = z.object({
	url: z.string().trim().min(1).max(2048),
	category: z.string().trim().min(1).max(32),
	signature: signatureSchema.nullable().default(null),
});

type SubmitPayload = z.infer<typeof submitPayloadSchema>;

class InvalidRequestError extends Error {
	readonly _tag = "InvalidRequestError";
}

class RateLimitError extends Error {
	readonly _tag = "RateLimitError";

	constructor(
		message: string,
		readonly retryAfterSeconds: number,
	) {
		super(message);
	}
}

class UpstreamError extends Error {
	readonly _tag = "UpstreamError";

	constructor(
		message: string,
		readonly retryable: boolean,
	) {
		super(message);
	}
}

class TimeoutError extends Error {
	readonly _tag = "TimeoutError";

	constructor(readonly stage: string) {
		super(`${stage} timed out`);
	}
}

function jsonError(
	message: string,
	status: number,
	retryAfterSeconds?: number,
) {
	const headers: HeadersInit | undefined = retryAfterSeconds
		? { "Retry-After": String(retryAfterSeconds) }
		: undefined;

	return Response.json({ error: message }, { status, headers });
}

function hashInput(input: string): string {
	return createHash("sha256").update(input).digest("hex").slice(0, 32);
}

function pruneRateLimit(now: number) {
	for (const [key, timestamps] of rateLimit) {
		const fresh = timestamps.filter(
			(timestamp) => timestamp > now - RATE_LIMIT_WINDOW_MS,
		);
		if (fresh.length === 0) {
			rateLimit.delete(key);
			continue;
		}
		rateLimit.set(key, fresh);
	}
}

function applyRateLimit(clientKey: string): number | null {
	const now = Date.now();

	if (rateLimit.size > MAX_TRACKED_CLIENTS) {
		pruneRateLimit(now);
	}

	const timestamps = (rateLimit.get(clientKey) ?? []).filter(
		(timestamp) => timestamp > now - RATE_LIMIT_WINDOW_MS,
	);

	if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
		const oldest = timestamps[0] ?? now;
		const retryAfterMs = Math.max(1, RATE_LIMIT_WINDOW_MS - (now - oldest));
		return Math.ceil(retryAfterMs / 1000);
	}

	timestamps.push(now);
	rateLimit.set(clientKey, timestamps);
	return null;
}

function pruneRecentUrls(now: number) {
	for (const [key, expiresAt] of recentUrls) {
		if (expiresAt <= now) recentUrls.delete(key);
	}
}

function getDuplicateRetryAfter(url: string): number | null {
	const now = Date.now();

	if (recentUrls.size > MAX_TRACKED_URLS) {
		pruneRecentUrls(now);
	}

	const key = hashInput(url);
	const expiresAt = recentUrls.get(key);
	if (expiresAt && expiresAt > now) {
		return Math.ceil((expiresAt - now) / 1000);
	}

	return null;
}

function markRecentUrl(url: string) {
	recentUrls.set(hashInput(url), Date.now() + URL_DEDUPE_WINDOW_MS);
}

function getClientIp(request: Request): string {
	const forwarded = request.headers
		.get("x-forwarded-for")
		?.split(",")[0]
		?.trim();
	const realIp = request.headers.get("x-real-ip")?.trim();
	return (forwarded ?? realIp ?? "unknown").slice(0, 128);
}

function getClientKey(request: Request): string {
	const ip = getClientIp(request);
	const userAgent = (request.headers.get("user-agent") ?? "").slice(0, 160);
	const day = new Date().toISOString().slice(0, 10);
	return hashInput(`${day}|${ip}|${userAgent}`);
}

function ensureTrustedOrigin(request: Request) {
	const allowedOrigin = new URL(BASE_URL).origin;
	const origin = request.headers.get("origin");

	if (origin && origin !== allowedOrigin) {
		throw new InvalidRequestError("invalid request origin");
	}

	const referer = request.headers.get("referer");
	if (!origin && referer) {
		let refererOrigin = "";
		try {
			refererOrigin = new URL(referer).origin;
		} catch {
			throw new InvalidRequestError("invalid referer");
		}

		if (refererOrigin !== allowedOrigin) {
			throw new InvalidRequestError("invalid referer");
		}
	}

	const fetchSite = request.headers.get("sec-fetch-site");
	if (
		fetchSite &&
		fetchSite !== "same-origin" &&
		fetchSite !== "same-site" &&
		fetchSite !== "none"
	) {
		throw new InvalidRequestError("cross-site request blocked");
	}
}

function ensureJsonRequest(request: Request) {
	const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
	if (!contentType.includes("application/json")) {
		throw new InvalidRequestError("invalid content type");
	}
}

function normalizeBookmarkUrl(rawUrl: string): URL {
	let url: URL;

	try {
		url = new URL(rawUrl);
	} catch {
		throw new InvalidRequestError("invalid url");
	}

	if (url.protocol !== "http:" && url.protocol !== "https:") {
		throw new InvalidRequestError("invalid url protocol");
	}

	if (url.username || url.password) {
		throw new InvalidRequestError("invalid url auth");
	}

	url.hostname = url.hostname.toLowerCase();
	url.hash = "";

	if (
		(url.protocol === "http:" && url.port === "80") ||
		(url.protocol === "https:" && url.port === "443")
	) {
		url.port = "";
	}

	if (url.pathname !== "/") {
		url.pathname = url.pathname.replace(/\/+$/g, "");
	}

	url.searchParams.sort();

	return url;
}

function isPrivateIpv4(address: string): boolean {
	const parts = address.split(".").map((part) => Number(part));
	if (parts.length !== 4 || parts.some((part) => Number.isNaN(part)))
		return true;

	const [a, b] = parts;
	return (
		a === 10 ||
		a === 127 ||
		a === 0 ||
		(a === 169 && b === 254) ||
		(a === 172 && b >= 16 && b <= 31) ||
		(a === 192 && b === 168)
	);
}

function isPrivateIpv6(address: string): boolean {
	const value = address.toLowerCase();

	if (value === "::1" || value === "::") return true;
	if (value.startsWith("fc") || value.startsWith("fd")) return true;
	if (/^fe[89ab]/.test(value)) return true;

	if (value.includes(".")) {
		const mapped = value.slice(value.lastIndexOf(":") + 1);
		if (isIP(mapped) === 4) return isPrivateIpv4(mapped);
	}

	return false;
}

function isPrivateAddress(address: string): boolean {
	const family = isIP(address);
	if (family === 4) return isPrivateIpv4(address);
	if (family === 6) return isPrivateIpv6(address);
	return true;
}

async function ensurePublicHost(url: URL) {
	const hostname = url.hostname;

	if (
		hostname === "localhost" ||
		hostname.endsWith(".localhost") ||
		hostname.endsWith(".local")
	) {
		throw new InvalidRequestError("private network urls are not allowed");
	}

	if (isIP(hostname)) {
		if (isPrivateAddress(hostname)) {
			throw new InvalidRequestError("private network urls are not allowed");
		}
		return;
	}

	let records: Array<{ address: string }>;
	try {
		records = await lookup(hostname, { all: true, verbatim: true });
	} catch {
		throw new InvalidRequestError("url host cannot be resolved");
	}

	if (
		records.length === 0 ||
		records.some((record) => isPrivateAddress(record.address))
	) {
		throw new InvalidRequestError("private network urls are not allowed");
	}
}

function escapeXml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function computeDrawnViewBox(paths: string[]): string {
	let minX = Number.POSITIVE_INFINITY;
	let minY = Number.POSITIVE_INFINITY;
	let maxX = Number.NEGATIVE_INFINITY;
	let maxY = Number.NEGATIVE_INFINITY;

	for (const d of paths) {
		const nums = d.match(COORD_RE);
		if (!nums) continue;
		for (let i = 0; i < nums.length - 1; i += 2) {
			const x = Number(nums[i]);
			const y = Number(nums[i + 1]);
			if (x < minX) minX = x;
			if (x > maxX) maxX = x;
			if (y < minY) minY = y;
			if (y > maxY) maxY = y;
		}
	}

	if (!Number.isFinite(minX)) return "0 0 400 120";

	const pad = 6;
	minX = Math.max(0, minX - pad);
	minY = Math.max(0, minY - pad);
	maxX += pad;
	maxY += pad;

	const width = Math.max(maxX - minX, 1);
	const height = Math.max(maxY - minY, 1);

	return `${minX} ${minY} ${width} ${height}`;
}

function buildSignatureSvg(signature: SignatureData): string | null {
	if (!signature || signature.type === "anonymous") return null;

	if (signature.type === "text") {
		const text = escapeXml(signature.value.trim());
		if (!text) return null;

		return [
			'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="180" viewBox="0 0 640 180">',
			'<rect width="640" height="180" fill="#0b0b0c"/>',
			'<rect x="0.5" y="0.5" width="639" height="179" fill="none" stroke="#2f2f33"/>',
			`<text x="320" y="110" text-anchor="middle" fill="#f2f2f2" font-size="56" font-style="italic" font-family="Georgia, Times New Roman, serif">${text}</text>`,
			"</svg>",
		].join("");
	}

	if (signature.type !== "draw" || signature.paths.length === 0) return null;

	const viewBox = computeDrawnViewBox(signature.paths);
	const paths = signature.paths
		.map(
			(d: string) =>
				`<path d="${d}" fill="none" stroke="#f2f2f2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
		)
		.join("");

	return [
		'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="180" viewBox="0 0 640 180">',
		'<rect width="640" height="180" fill="#0b0b0c"/>',
		'<rect x="0.5" y="0.5" width="639" height="179" fill="none" stroke="#2f2f33"/>',
		`<g transform="translate(24 24)"><svg width="592" height="132" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">${paths}</svg></g>`,
		"</svg>",
	].join("");
}

async function ensureResvgWasm() {
	if (!wasmInitPromise) {
		wasmInitPromise = (async () => {
			const wasmPath = require.resolve("@resvg/resvg-wasm/index_bg.wasm");
			const wasm = await readFile(wasmPath);
			await initWasm(wasm);
		})();
	}

	await wasmInitPromise;
}

async function buildSignaturePng(
	signature: SignatureData,
): Promise<Uint8Array | null> {
	if (!signature || signature.type !== "draw") return null;

	const svg = buildSignatureSvg(signature);
	if (!svg) return null;

	try {
		await ensureResvgWasm();
		const resvg = new Resvg(svg, {
			fitTo: {
				mode: "width",
				value: 960,
			},
		});
		return resvg.render().asPng();
	} catch {
		return null;
	}
}

function parseHtmlMetadata(html: string, fallbackTitle: string) {
	const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
	const descMatch =
		html.match(
			/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i,
		) ??
		html.match(
			/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i,
		);

	return {
		title: titleMatch?.[1]?.trim() ?? fallbackTitle,
		description: descMatch?.[1]?.trim() ?? "",
	};
}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function isAbortError(error: unknown): boolean {
	if (error instanceof DOMException) return error.name === "AbortError";
	if (error instanceof Error) return error.name === "AbortError";
	return false;
}

async function withTimeout<T>(
	ms: number,
	stage: string,
	task: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), ms);

	try {
		return await task(controller.signal);
	} catch (error) {
		if (isAbortError(error)) {
			throw new TimeoutError(stage);
		}
		throw error;
	} finally {
		clearTimeout(timeout);
	}
}

async function retry<T>(
	attempts: number,
	task: (attempt: number) => Promise<T>,
	shouldRetry: (error: unknown) => boolean,
): Promise<T> {
	let lastError: unknown;

	for (let attempt = 1; attempt <= attempts; attempt++) {
		try {
			return await task(attempt);
		} catch (error) {
			lastError = error;
			if (attempt >= attempts || !shouldRetry(error)) {
				throw error;
			}
			await sleep(RETRY_BASE_DELAY_MS * attempt);
		}
	}

	throw lastError;
}

function isTransientNetworkError(error: unknown): boolean {
	if (error instanceof TimeoutError) return true;
	if (error instanceof TypeError) return true;
	if (!(error instanceof Error)) return false;
	if (error.name === "AbortError") return true;

	const message = error.message.toLowerCase();
	return (
		message.includes("network") ||
		message.includes("timeout") ||
		message.includes("econn") ||
		message.includes("socket")
	);
}

function isRetryableUpstream(error: unknown): boolean {
	if (error instanceof UpstreamError) return error.retryable;
	return isTransientNetworkError(error);
}

async function fetchUrlMetadata(
	url: URL,
): Promise<{ title: string; description: string }> {
	const fallback = { title: url.hostname, description: "" };

	try {
		const html = await retry(
			2,
			() =>
				withTimeout(METADATA_TIMEOUT_MS, "metadata fetch", async (signal) => {
					let current = new URL(url.toString());

					for (let hop = 0; hop <= MAX_METADATA_REDIRECTS; hop++) {
						await ensurePublicHost(current);

						const response = await fetch(current.toString(), {
							signal,
							headers: { "User-Agent": "emots.dev bookmark bot" },
							redirect: "manual",
						});

						if (response.status >= 300 && response.status < 400) {
							if (hop === MAX_METADATA_REDIRECTS) {
								throw new UpstreamError(
									"metadata redirect limit exceeded",
									false,
								);
							}

							const location = response.headers.get("location");
							if (!location) {
								throw new UpstreamError(
									"metadata redirect missing location",
									false,
								);
							}

							let next: URL;
							try {
								next = new URL(location, current);
							} catch {
								throw new UpstreamError("metadata redirect invalid", false);
							}

							if (next.protocol !== "http:" && next.protocol !== "https:") {
								throw new UpstreamError(
									"metadata redirect protocol invalid",
									false,
								);
							}

							if (next.username || next.password) {
								throw new UpstreamError("metadata redirect invalid", false);
							}

							next.hash = "";
							current = next;
							continue;
						}

						if (!response.ok) {
							throw new UpstreamError(
								`metadata fetch failed: ${response.status}`,
								response.status >= 500,
							);
						}

						return response.text();
					}

					throw new UpstreamError("metadata redirect limit exceeded", false);
				}),
			isRetryableUpstream,
		);

		return parseHtmlMetadata(html, fallback.title);
	} catch {
		return fallback;
	}
}

function normalizeSignature(
	signature: SubmitPayload["signature"],
): SignatureData {
	if (!signature) return { type: "anonymous" };

	if (signature.type === "draw") {
		return {
			type: "draw",
			paths: compressPaths(signature.paths),
		};
	}

	return {
		type: "text",
		value: signature.value.trim(),
	};
}

function getSignatureLabel(signature: SignatureData): string {
	if (!signature || signature.type === "anonymous") return "anonymous";
	if (signature.type === "text") return `[typed] ${signature.value}`;
	return `[drawn signature - ${signature.paths.length} stroke${signature.paths.length === 1 ? "" : "s"}]`;
}

function buildDiscordForm(
	payloadJson: string,
	signaturePng: Uint8Array | null,
): FormData {
	const form = new FormData();
	form.append("payload_json", payloadJson);

	if (signaturePng) {
		const pngBytes = new Uint8Array(signaturePng.byteLength);
		pngBytes.set(signaturePng);
		form.append(
			"files[0]",
			new Blob([pngBytes], { type: "image/png" }),
			"signature.png",
		);
	}

	return form;
}

async function sendToDiscord(
	webhookUrl: string,
	payloadJson: string,
	signaturePng: Uint8Array | null,
) {
	try {
		await retry(
			2,
			() =>
				withTimeout(WEBHOOK_TIMEOUT_MS, "discord webhook", async (signal) => {
					const response = await fetch(webhookUrl, {
						method: "POST",
						signal,
						body: buildDiscordForm(payloadJson, signaturePng),
					});

					if (!response.ok) {
						throw new UpstreamError(
							`discord webhook failed: ${response.status}`,
							response.status >= 500 || response.status === 429,
						);
					}
				}),
			isRetryableUpstream,
		);
	} catch {
		throw new UpstreamError("failed to send submission", false);
	}
}

async function parsePayload(request: Request): Promise<SubmitPayload> {
	let raw: unknown;

	try {
		raw = await request.json();
	} catch {
		throw new InvalidRequestError("invalid request body");
	}

	const parsed = submitPayloadSchema.safeParse(raw);
	if (!parsed.success) {
		throw new InvalidRequestError("invalid payload");
	}

	return parsed.data;
}

function toErrorResponse(error: unknown): Response {
	if (error instanceof RateLimitError) {
		return jsonError(error.message, 429, error.retryAfterSeconds);
	}

	if (error instanceof InvalidRequestError) {
		return jsonError(error.message, 400);
	}

	if (error instanceof UpstreamError || error instanceof TimeoutError) {
		return jsonError("failed to send submission", 502);
	}

	if (error instanceof z.ZodError) {
		return jsonError("invalid payload", 400);
	}

	return jsonError("failed to process submission", 500);
}

export const Route = createFileRoute("/api/bookmarks/submit")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const webhookUrl = env.DISCORD_BOOKMARKS_WEBHOOK_URL;
				if (!webhookUrl) {
					return jsonError("submissions not configured", 500);
				}

				try {
					ensureTrustedOrigin(request);
					ensureJsonRequest(request);

					const clientKey = getClientKey(request);
					const retryAfter = applyRateLimit(clientKey);
					if (retryAfter) {
						throw new RateLimitError(
							"too many submissions. try again later.",
							retryAfter,
						);
					}

					const payload = await parsePayload(request);
					const normalizedUrl = normalizeBookmarkUrl(payload.url);
					await ensurePublicHost(normalizedUrl);

					const duplicateRetryAfter = getDuplicateRetryAfter(
						normalizedUrl.toString(),
					);
					if (duplicateRetryAfter) {
						throw new RateLimitError(
							"similar link submitted recently. try again shortly.",
							duplicateRetryAfter,
						);
					}

					const collections = await getCollections({ includeEmpty: true });
					const collection = collections.find(
						(item) => String(item._id) === payload.category,
					);

					if (!collection) {
						throw new InvalidRequestError("invalid category");
					}

					const metadata = await fetchUrlMetadata(normalizedUrl);
					const normalizedSignature = normalizeSignature(payload.signature);
					const drawSignatureForDiscord =
						payload.signature?.type === "draw"
							? {
									type: "draw" as const,
									paths: payload.signature.paths,
								}
							: null;

					const tokenData = JSON.stringify({
						url: normalizedUrl.toString(),
						title: metadata.title,
						excerpt: metadata.description,
						collectionId: collection._id,
						signature: normalizedSignature,
						exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
					});

					const encodedData = compressToken(tokenData);
					const signature = await signToken(encodedData);
					const approveUrl = `${BASE_URL}/api/bookmarks/approve?data=${encodedData}&sig=${signature}`;
					const rejectUrl = `${BASE_URL}/api/bookmarks/reject?data=${encodedData}&sig=${signature}`;

					const signaturePng = drawSignatureForDiscord
						? await buildSignaturePng(drawSignatureForDiscord)
						: null;
					const signatureText = getSignatureLabel(normalizedSignature);

					const discordPayload = {
						embeds: [
							{
								title: "Bookmark Submission",
								description: `[Approve](${approveUrl}) · [Reject](${rejectUrl})`,
								color: 0x808080,
								fields: [
									{
										name: "URL",
										value: normalizedUrl.toString(),
										inline: false,
									},
									{ name: "Title", value: metadata.title, inline: true },
									{
										name: "Category",
										value: collection?.title ?? "none",
										inline: true,
									},
									{
										name: "Description",
										value: metadata.description || "-",
										inline: false,
									},
									{ name: "Signature", value: signatureText, inline: false },
								],
								...(signaturePng
									? { image: { url: "attachment://signature.png" } }
									: {}),
								timestamp: new Date().toISOString(),
							},
						],
						...(signaturePng
							? { attachments: [{ id: 0, filename: "signature.png" }] }
							: {}),
					};

					await sendToDiscord(
						webhookUrl,
						JSON.stringify(discordPayload),
						signaturePng,
					);

					markRecentUrl(normalizedUrl.toString());

					return Response.json({ success: true });
				} catch (error) {
					return toErrorResponse(error);
				}
			},
		},
	},
});
