"use client";

import type { BookmarkView } from "@/components/bookmarks/bookmark-grid";
import { CategoryTabs } from "@/components/bookmarks/category-tabs";
import { ViewToggle } from "@/components/bookmarks/view-toggle";
import type { RaindropCollection } from "@/lib/raindrop";

export function BookmarksToolbar({
	collections,
	activeSlug,
	label,
	meta,
	view,
	onViewChange,
}: {
	collections: RaindropCollection[];
	activeSlug: string | null;
	label: string;
	meta: string;
	view: BookmarkView;
	onViewChange: (next: BookmarkView) => void;
}) {
	return (
		<div className="flex flex-col gap-4">
			<CategoryTabs collections={collections} activeSlug={activeSlug} />
			<div className="flex min-h-8 items-center justify-between gap-3">
				<div className="flex items-baseline gap-2">
					<h2 className="text-sm font-medium">{label}</h2>
					<span className="text-xs text-gray-400">{meta}</span>
				</div>
				<ViewToggle value={view} onChange={onViewChange} />
			</div>
		</div>
	);
}
