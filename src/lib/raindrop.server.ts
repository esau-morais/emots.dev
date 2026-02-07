import { createServerFn } from "@tanstack/react-start";
import { getCollections, getRaindrops } from "@/lib/raindrop";

export const fetchCollections = createServerFn({ method: "GET" })
	.inputValidator((d?: { includeEmpty?: boolean }) => d ?? {})
	.handler(async ({ data }: { data?: { includeEmpty?: boolean } }) => {
		return getCollections({ includeEmpty: data?.includeEmpty ?? false });
	});

export const fetchRaindrops = createServerFn({ method: "GET" })
	.inputValidator(
		(d: { collectionId: number; page: number; perPage?: number }) => d,
	)
	.handler(
		async ({
			data,
		}: {
			data: { collectionId: number; page: number; perPage?: number };
		}) => {
			return getRaindrops(data.collectionId, data.page, data.perPage);
		},
	);
