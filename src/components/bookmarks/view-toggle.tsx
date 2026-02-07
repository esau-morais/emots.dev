"use client";

import { ListBulletsIcon, SquaresFourIcon } from "@phosphor-icons/react";
import { cn } from "@/utils/classNames";
import type { BookmarkView } from "./bookmark-grid";

export function ViewToggle({
	value,
	onChange,
}: {
	value: BookmarkView;
	onChange: (next: BookmarkView) => void;
}) {
	return (
		<div className="inline-flex items-center border border-gray-800">
			<button
				type="button"
				aria-pressed={value === "grid"}
				onClick={() => onChange("grid")}
				className={cn(
					"border-r border-gray-800 p-1.5 transition-colors focus:outline-none",
					value === "grid"
						? "bg-gray-900 text-white"
						: "text-gray-500 hover:text-gray-200 focus-visible:text-gray-200",
				)}
				aria-label="Grid view"
				data-sound="click"
			>
				<SquaresFourIcon size={14} aria-hidden="true" />
			</button>
			<button
				type="button"
				aria-pressed={value === "list"}
				onClick={() => onChange("list")}
				className={cn(
					"p-1.5 transition-colors focus:outline-none",
					value === "list"
						? "bg-gray-900 text-white"
						: "text-gray-500 hover:text-gray-200 focus-visible:text-gray-200",
				)}
				aria-label="List view"
				data-sound="click"
			>
				<ListBulletsIcon size={14} aria-hidden="true" />
			</button>
		</div>
	);
}
