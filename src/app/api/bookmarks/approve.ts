import { createHash } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import {
	decompressToken,
	htmlResponse,
	verifyToken,
} from "@/lib/bookmarks-auth";
import {
	createRaindrop,
	encodeSignatureForNote,
	type SignatureData,
} from "@/lib/raindrop";

type ApprovalData = {
	url: string;
	title: string;
	excerpt: string;
	collectionId: number | null;
	signature: SignatureData;
	exp: number;
};

const MAX_TOKEN_DATA_LENGTH = 8_192;
const MAX_TRACKED_APPROVALS = 5_000;
const PENDING_LOCK_MS = 60_000;

type ApprovalState = {
	status: "pending" | "consumed";
	expiresAt: number;
	updatedAt: number;
};

const approvalStates = new Map<string, ApprovalState>();

function approvalKey(data: string, sig: string): string {
	return createHash("sha256").update(`${sig}.${data}`).digest("hex");
}

function pruneApprovalStates(now: number) {
	for (const [key, state] of approvalStates) {
		if (state.status === "consumed" && state.expiresAt <= now) {
			approvalStates.delete(key);
			continue;
		}

		if (state.status === "pending" && now - state.updatedAt > PENDING_LOCK_MS) {
			approvalStates.delete(key);
		}
	}
}

function tryAcquireApproval(
	key: string,
	expiresAt: number,
): "acquired" | "pending" | "consumed" {
	const now = Date.now();

	if (approvalStates.size >= MAX_TRACKED_APPROVALS) {
		pruneApprovalStates(now);
	}

	const existing = approvalStates.get(key);
	if (existing) {
		if (existing.status === "consumed" && existing.expiresAt > now) {
			return "consumed";
		}

		if (
			existing.status === "pending" &&
			now - existing.updatedAt <= PENDING_LOCK_MS
		) {
			return "pending";
		}
	}

	approvalStates.set(key, {
		status: "pending",
		expiresAt,
		updatedAt: now,
	});

	return "acquired";
}

function releaseApproval(key: string) {
	const state = approvalStates.get(key);
	if (state?.status === "pending") approvalStates.delete(key);
}

function markApprovalConsumed(key: string, expiresAt: number) {
	approvalStates.set(key, {
		status: "consumed",
		expiresAt,
		updatedAt: Date.now(),
	});
}

export const Route = createFileRoute("/api/bookmarks/approve")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const url = new URL(request.url);
				const data = url.searchParams.get("data");
				const sig = url.searchParams.get("sig");

				if (!data || !sig) {
					return htmlResponse("invalid", "missing parameters", false);
				}

				if (data.length > MAX_TOKEN_DATA_LENGTH) {
					return htmlResponse("invalid", "malformed data", false);
				}

				let decoded: string;
				const validEncoded = await verifyToken(data, sig);

				if (validEncoded) {
					try {
						decoded = decompressToken(data);
					} catch {
						return htmlResponse("invalid", "malformed data", false);
					}
				} else {
					try {
						decoded = decompressToken(data);
					} catch {
						return htmlResponse("invalid", "malformed data", false);
					}

					const validLegacy = await verifyToken(decoded, sig);
					if (!validLegacy) {
						return htmlResponse(
							"invalid",
							"signature verification failed",
							false,
						);
					}
				}

				let payload: ApprovalData;
				try {
					payload = JSON.parse(decoded) as ApprovalData;
				} catch {
					return htmlResponse("invalid", "malformed data", false);
				}

				if (Date.now() > payload.exp) {
					return htmlResponse(
						"expired",
						"this approval link has expired",
						false,
					);
				}

				if (payload.collectionId === null) {
					return htmlResponse(
						"no category",
						`bookmark for ${payload.url} has no category. add it manually to raindrop.`,
						false,
					);
				}

				const key = approvalKey(data, sig);
				const acquireState = tryAcquireApproval(key, payload.exp);

				if (acquireState === "consumed") {
					return htmlResponse(
						"already approved",
						"this approval link was already used.",
						true,
					);
				}

				if (acquireState === "pending") {
					return htmlResponse(
						"processing",
						"this approval is already being processed.",
						false,
					);
				}

				const note = encodeSignatureForNote(payload.signature);
				let created = false;
				try {
					created = await createRaindrop({
						link: payload.url,
						title: payload.title,
						excerpt: payload.excerpt,
						collectionId: payload.collectionId,
						note,
					});
				} catch {
					releaseApproval(key);
					return htmlResponse(
						"failed",
						"could not create raindrop. check API token.",
						false,
					);
				}

				if (!created) {
					releaseApproval(key);
					return htmlResponse(
						"failed",
						"could not create raindrop. check API token.",
						false,
					);
				}

				markApprovalConsumed(key, payload.exp);

				return htmlResponse(
					"approved",
					`${payload.title} has been added to your bookmarks.`,
					true,
				);
			},
		},
	},
});
