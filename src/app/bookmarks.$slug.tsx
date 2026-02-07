import {
	createFileRoute,
	getRouteApi,
	notFound,
	useNavigate,
} from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { BookmarkGrid } from "@/components/bookmarks/bookmark-grid";
import { BookmarksToolbar } from "@/components/bookmarks/bookmarks-toolbar";
import type { RaindropCollection, RaindropItem } from "@/lib/raindrop";
import { fetchRaindrops } from "@/lib/raindrop.server";
import { BASE_URL } from "@/utils/consts";

const bookmarksRoute = getRouteApi("/bookmarks");
const INITIAL_PAGE_SIZE = 24;

export const Route = createFileRoute("/bookmarks/$slug")({
	staleTime: 1000 * 60 * 5,
	loader: async ({ params, parentMatchPromise }) => {
		if (!parentMatchPromise) throw notFound();
		const parentMatch = await parentMatchPromise;
		const { collections } = parentMatch.loaderData as unknown as {
			collections: RaindropCollection[];
		};
		const active = collections.find((c) => c.slug === params.slug);

		if (!active) throw notFound();

		const { items, totalCount } = await fetchRaindrops({
			data: { collectionId: active._id, page: 0, perPage: INITIAL_PAGE_SIZE },
		});

		return { active, initialItems: items, totalCount };
	},
	head: ({ loaderData }) => {
		if (!loaderData) return { meta: [{ title: "not found" }] };
		const { active } = loaderData;
		return {
			meta: [
				{
					title: `${active.title.toLowerCase()} bookmarks | Esaú Morais`,
				},
				{
					name: "description",
					content: `${active.count} bookmarks in ${active.title.toLowerCase()}`,
				},
				{
					property: "og:title",
					content: `${active.title.toLowerCase()} bookmarks`,
				},
				{
					property: "og:url",
					content: `${BASE_URL}/bookmarks/${active.slug}`,
				},
			],
		};
	},
	component: BookmarksCategoryPage,
});

function BookmarksCategoryPage() {
	const { collections } = bookmarksRoute.useLoaderData();
	const { view } = bookmarksRoute.useSearch();
	const { active, initialItems, totalCount } = Route.useLoaderData();
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

	return (
		<div className="flex flex-col gap-6">
			<BookmarksToolbar
				collections={collections}
				activeSlug={active.slug}
				label={active.title.toLowerCase()}
				meta={`${active.count} bookmark${active.count !== 1 ? "s" : ""}`}
				view={currentView}
				onViewChange={setView}
			/>

			<BookmarkList
				key={active._id}
				collectionId={active._id}
				initialItems={initialItems}
				totalCount={totalCount}
				pageSize={INITIAL_PAGE_SIZE}
				view={currentView}
			/>
		</div>
	);
}

function BookmarkList({
	collectionId,
	initialItems,
	totalCount,
	pageSize,
	view,
}: {
	collectionId: number;
	initialItems: RaindropItem[];
	totalCount: number;
	pageSize: number;
	view: "grid" | "list";
}) {
	const [items, setItems] = useState(initialItems);
	const [page, setPage] = useState(0);
	const [loading, setLoading] = useState(false);
	const hasMore = items.length < totalCount;

	const loadMore = useCallback(async () => {
		if (loading || !hasMore) return;
		setLoading(true);
		try {
			const next = page + 1;
			const result = await fetchRaindrops({
				data: { collectionId, page: next, perPage: pageSize },
			});
			setItems((prev) => [...prev, ...result.items]);
			setPage(next);
		} finally {
			setLoading(false);
		}
	}, [collectionId, page, loading, hasMore, pageSize]);

	return (
		<>
			<BookmarkGrid items={items} view={view} />
			{hasMore ? (
				<button
					type="button"
					onClick={loadMore}
					disabled={loading}
					className="w-full border border-gray-800 py-2.5 text-xs text-gray-500 transition-colors hover:border-gray-700 hover:text-gray-200 focus:outline-none focus-visible:border-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
					data-sound="click"
				>
					{loading ? "loading..." : "load more"}
				</button>
			) : null}
		</>
	);
}
