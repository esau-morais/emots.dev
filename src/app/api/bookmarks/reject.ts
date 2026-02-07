import { createFileRoute } from "@tanstack/react-router";
import {
	decompressToken,
	htmlResponse,
	verifyToken,
} from "@/lib/bookmarks-auth";

const MAX_TOKEN_DATA_LENGTH = 8_192;

export const Route = createFileRoute("/api/bookmarks/reject")({
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

				const validEncoded = await verifyToken(data, sig);
				if (validEncoded) {
					try {
						decompressToken(data);
					} catch {
						return htmlResponse("invalid", "malformed data", false);
					}
				} else {
					let decoded: string;
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

				return htmlResponse(
					"rejected",
					"bookmark submission has been rejected.",
					false,
				);
			},
		},
	},
});
