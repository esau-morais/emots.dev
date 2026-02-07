"use client";

import { Link } from "@tanstack/react-router";
import type { RaindropCollection } from "@/lib/raindrop";
import { cn } from "@/utils/classNames";

export function CategoryTabs({
	collections,
	activeSlug,
}: {
	collections: RaindropCollection[];
	activeSlug: string | null;
}) {
	const allActive = activeSlug === null;

	return (
		<div
			className="flex gap-2 overflow-x-auto hide-scrollbar py-1"
			role="tablist"
			aria-label="Bookmark categories"
		>
			<Link
				to="/bookmarks"
				search={(prev) => prev}
				activeOptions={{ exact: true }}
				role="tab"
				aria-selected={allActive}
				className={cn(
					"shrink-0 border px-3 py-1 text-xs transition-colors focus:outline-none",
					allActive
						? "border-gray-700 bg-gray-900 text-white"
						: "border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200 focus-visible:border-gray-700 focus-visible:text-gray-200",
				)}
				data-sound="hover"
			>
				all
			</Link>
			{collections.map((c) => {
				const isActive = c.slug === activeSlug;
				return (
					<Link
						key={c._id}
						to="/bookmarks/$slug"
						params={{ slug: c.slug }}
						search={(prev) => prev}
						role="tab"
						aria-selected={isActive}
						className={cn(
							"shrink-0 border px-3 py-1 text-xs transition-colors focus:outline-none",
							isActive
								? "border-gray-700 bg-gray-900 text-white"
								: "border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200 focus-visible:border-gray-700 focus-visible:text-gray-200",
						)}
						data-sound="hover"
					>
						{c.title.toLowerCase()}
					</Link>
				);
			})}
		</div>
	);
}
