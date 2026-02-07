"use client";

import { ArrowUpRightIcon } from "@phosphor-icons/react";
import type { RaindropItem } from "@/lib/raindrop";
import { decodeSignatureFromNote } from "@/lib/raindrop";
import { BookmarkCard } from "./bookmark-card";

export type BookmarkView = "grid" | "list";

export function BookmarkGrid({
	items,
	view,
}: {
	items: RaindropItem[];
	view: BookmarkView;
}) {
	if (items.length === 0) {
		return (
			<p className="py-12 text-center text-sm text-gray-500">
				no bookmarks yet
			</p>
		);
	}

	if (view === "list") {
		return (
			<ul className="divide-y divide-gray-800">
				{items.map((item) => {
					const hasCommunitySignature =
						decodeSignatureFromNote(item.note ?? "") !== null;

					return (
						<li key={item._id}>
							<a
								href={item.link}
								target="_blank"
								rel="noopener noreferrer"
								className="group/row flex items-center justify-between gap-4 px-3 py-3 transition-colors hover:bg-gray-950 focus-visible:bg-gray-950 focus:outline-none"
								data-sound="hover"
							>
								<div className="min-w-0">
									<h3 className="line-clamp-1 text-sm text-white">
										{item.title}
									</h3>
									<div className="mt-0.5 flex items-center gap-2">
										<p className="line-clamp-1 text-xs text-gray-400">
											{item.domain}
										</p>
										{hasCommunitySignature ? (
											<span className="border border-gray-700 px-1 py-0 text-[10px] uppercase tracking-wide text-gray-500">
												submitted
											</span>
										) : null}
									</div>
								</div>
								<ArrowUpRightIcon
									size={14}
									className="shrink-0 text-gray-500 transition-colors group-hover/row:text-gray-200 group-focus-visible/row:text-gray-200"
									aria-hidden="true"
								/>
							</a>
						</li>
					);
				})}
			</ul>
		);
	}

	return (
		<ul className="columns-1 gap-4 sm:columns-2">
			{items.map((item) => (
				<li key={item._id} className="mb-4 break-inside-avoid">
					<BookmarkCard
						item={item}
						signature={decodeSignatureFromNote(item.note ?? "")}
					/>
				</li>
			))}
		</ul>
	);
}
