import { deflateSync, inflateSync } from "node:zlib";
import { server as env } from "@/lib/env/server";

const MAX_COMPRESSED_TOKEN_BYTES = 8_192;
const MAX_DECOMPRESSED_TOKEN_BYTES = 16_384;

export async function signToken(payload: string): Promise<string> {
	const secret = env.BOOKMARKS_APPROVAL_SECRET;
	if (!secret) throw new Error("Missing approval secret");

	const key = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const sig = await crypto.subtle.sign(
		"HMAC",
		key,
		new TextEncoder().encode(payload),
	);
	return Buffer.from(sig).toString("hex");
}

export async function verifyToken(data: string, sig: string): Promise<boolean> {
	const secret = env.BOOKMARKS_APPROVAL_SECRET;
	if (!secret) return false;

	if (!/^[0-9a-f]{64}$/i.test(sig)) return false;

	const key = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["verify"],
	);

	const sigBytes = new Uint8Array(
		(sig.match(/.{2}/g) ?? []).map((b) => Number.parseInt(b, 16)),
	);

	return crypto.subtle.verify(
		"HMAC",
		key,
		sigBytes,
		new TextEncoder().encode(data),
	);
}

export function compressToken(json: string): string {
	const compressed = deflateSync(Buffer.from(json));
	return Buffer.from(compressed).toString("base64url");
}

export function decompressToken(encoded: string): string {
	const buf = Buffer.from(encoded, "base64url");

	if (buf.byteLength === 0 || buf.byteLength > MAX_COMPRESSED_TOKEN_BYTES) {
		throw new Error("invalid token size");
	}

	return inflateSync(buf, {
		maxOutputLength: MAX_DECOMPRESSED_TOKEN_BYTES,
	}).toString("utf-8");
}

export function compressPaths(paths: string[]): string[] {
	return paths.map((p) =>
		p.replace(/\d+\.\d+/g, (m) => String(Math.round(Number(m)))),
	);
}

export function htmlResponse(title: string, message: string, ok: boolean) {
	const color = ok ? "#4ade80" : "#f87171";
	const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#000;color:#fff;font-family:monospace}
.card{border:1px solid #333;padding:2rem;max-width:400px;text-align:center}
.status{color:${color};margin-bottom:1rem;font-size:1.25rem}
p{color:#888;font-size:0.875rem;line-height:1.5}
</style></head>
<body><div class="card"><div class="status">${title}</div><p>${message}</p></div></body></html>`;

	return new Response(html, {
		headers: { "Content-Type": "text/html;charset=utf-8" },
	});
}
