import { ArrowRightIcon } from "@phosphor-icons/react";
import {
	createFileRoute,
	getRouteApi,
	Link,
	useNavigate,
} from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import { BookmarkGrid } from "@/components/bookmarks/bookmark-grid";
import { BookmarksToolbar } from "@/components/bookmarks/bookmarks-toolbar";
import type { RaindropCollection, RaindropItem } from "@/lib/raindrop";
import { fetchRaindrops } from "@/lib/raindrop.server";

const bookmarksRoute = getRouteApi("/bookmarks");
const PREVIEW_LIMIT = 8;

type CollectionPreview = {
	collectionId: number;
	items: RaindropItem[];
	totalCount: number;
};

export const Route = createFileRoute("/bookmarks/")({
	staleTime: 1000 * 60 * 5,
	loader: async ({ parentMatchPromise }) => {
		if (!parentMatchPromise) return { previews: [] as CollectionPreview[] };
		const parentMatch = await parentMatchPromise;
		const { collections } = parentMatch.loaderData as unknown as {
			collections: RaindropCollection[];
		};

		const previews = await Promise.all(
			collections.map(async (collection) => {
				const { items, totalCount } = await fetchRaindrops({
					data: {
						collectionId: collection._id,
						page: 0,
						perPage: PREVIEW_LIMIT,
					},
				});

				return {
					collectionId: collection._id,
					items: items.slice(0, PREVIEW_LIMIT),
					totalCount,
				} satisfies CollectionPreview;
			}),
		);

		return { previews };
	},
	component: BookmarksIndex,
});

function BookmarksIndex() {
	const { collections } = bookmarksRoute.useLoaderData();
	const { view } = bookmarksRoute.useSearch();
	const { previews } = Route.useLoaderData();
	const navigate = useNavigate({ from: Route.fullPath });
	const currentView = view === "list" ? "list" : "grid";

	const setView = useCallback(
		(next: "grid" | "list") => {
			navigate({
				replace: true,
				search: (prev) => ({
					...prev,
					view: next === "grid" ? undefined : "list",
				}),
			});
		},
		[navigate],
	);

	const previewsByCollectionId = useMemo(
		() => new Map(previews.map((preview) => [preview.collectionId, preview])),
		[previews],
	);
	const totalBookmarks = useMemo(
		() => collections.reduce((acc, collection) => acc + collection.count, 0),
		[collections],
	);

	if (collections.length === 0) {
		return (
			<div className="flex flex-col gap-6">
				<BookmarksToolbar
					collections={collections}
					activeSlug={null}
					label="all collections"
					meta="0 collections"
					view={currentView}
					onViewChange={setView}
				/>
				<p className="py-12 text-center text-sm text-gray-500">
					no collections yet
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<BookmarksToolbar
				collections={collections}
				activeSlug={null}
				label="all collections"
				meta={`${totalBookmarks} bookmark${totalBookmarks !== 1 ? "s" : ""}`}
				view={currentView}
				onViewChange={setView}
			/>

			<div className="flex flex-col gap-6">
				{collections.map((collection) => {
					const preview = previewsByCollectionId.get(collection._id);
					const shownCount = preview?.items.length ?? 0;
					const totalCount = preview?.totalCount ?? collection.count;
					const isPreview = totalCount > shownCount;

					return (
						<section
							key={collection._id}
							className="rounded-xs py-2 transition-colors hover:bg-gray-950/40"
						>
							<div className="mb-3 flex items-center justify-between gap-3">
								<Link
									to="/bookmarks/$slug"
									params={{ slug: collection.slug }}
									search={(prev) => prev}
									className="group/link inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-white focus-visible:text-white focus:outline-none"
									data-sound="hover"
								>
									{collection.title.toLowerCase()}
									<ArrowRightIcon
										size={12}
										className="-translate-x-1 text-gray-600 opacity-0 transition-all duration-200 ease-out motion-reduce:transition-none group-hover/link:translate-x-0 group-hover/link:opacity-100 group-hover/link:text-gray-300 group-focus-visible/link:translate-x-0 group-focus-visible/link:opacity-100 group-focus-visible/link:text-gray-300"
										aria-hidden="true"
									/>
								</Link>

								<span className="text-xs text-gray-400">
									{isPreview
										? `showing ${shownCount} of ${totalCount}`
										: `${totalCount} bookmark${totalCount !== 1 ? "s" : ""}`}
								</span>
							</div>

							{preview ? (
								<BookmarkGrid items={preview.items} view={currentView} />
							) : (
								<p className="py-6 text-center text-xs text-gray-500">
									no bookmarks yet
								</p>
							)}
						</section>
					);
				})}
			</div>
		</div>
	);
}
