import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SubmitForm } from "@/components/bookmarks/submit-form";
import { fetchCollections } from "@/lib/raindrop.server";

type BookmarksSearch = {
	view?: "grid" | "list";
};

export const Route = createFileRoute("/bookmarks")({
	validateSearch: (search: Record<string, unknown>): BookmarksSearch => ({
		view:
			search.view === "list" || search.view === "grid"
				? search.view
				: undefined,
	}),
	staleTime: 1000 * 60 * 5,
	loader: async () => {
		const submitCollections = await fetchCollections({
			data: { includeEmpty: true },
		});
		const collections = submitCollections.filter(
			(collection) => collection.count > 0,
		);
		return { collections, submitCollections };
	},
	head: () => ({
		meta: [
			{ title: "bookmarks | Esaú Morais" },
			{
				name: "description",
				content: "links i find useful or interesting",
			},
		],
	}),
	component: BookmarksLayout,
});

function BookmarksLayout() {
	const { submitCollections } = Route.useLoaderData();

	return (
		<div className="mx-auto flex max-w-2xl flex-col gap-6 px-6">
			<div>
				<h1 className="mb-4 text-lg font-medium">bookmarks</h1>
				<p className="text-sm text-gray-500">
					links i find useful or interesting
				</p>
			</div>

			<SubmitForm collections={submitCollections} />

			<div className="border-t border-gray-800" />

			<Outlet />
		</div>
	);
}
