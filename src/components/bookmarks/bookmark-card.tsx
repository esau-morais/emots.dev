"use client";

import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import type { RaindropItem, SignatureData } from "@/lib/raindrop";
import { cn } from "@/utils/classNames";

const COORD_RE = /[-+]?\d+(?:\.\d+)?/g;

function computeViewBox(paths: string[]): string {
	let minX = Number.POSITIVE_INFINITY;
	let minY = Number.POSITIVE_INFINITY;
	let maxX = Number.NEGATIVE_INFINITY;
	let maxY = Number.NEGATIVE_INFINITY;

	for (const d of paths) {
		const nums = d.match(COORD_RE);
		if (!nums) continue;
		for (let i = 0; i < nums.length - 1; i += 2) {
			const x = Number(nums[i]);
			const y = Number(nums[i + 1]);
			if (x < minX) minX = x;
			if (x > maxX) maxX = x;
			if (y < minY) minY = y;
			if (y > maxY) maxY = y;
		}
	}

	if (!Number.isFinite(minX)) return "0 0 400 120";

	const pad = 6;
	minX = Math.max(0, minX - pad);
	minY = Math.max(0, minY - pad);
	maxX += pad;
	maxY += pad;

	const w = Math.max(maxX - minX, 1);
	const h = Math.max(maxY - minY, 1);
	return `${minX} ${minY} ${w} ${h}`;
}

function Signature({ data }: { data: SignatureData }) {
	const viewBox = useMemo(
		() => (data?.type === "draw" ? computeViewBox(data.paths) : ""),
		[data],
	);

	if (!data) return null;

	if (data.type === "text") {
		return (
			<span className="font-serif italic text-white text-xs">{data.value}</span>
		);
	}

	if (data.type === "anonymous") {
		return <span className="text-xs text-gray-500">anonymous</span>;
	}

	return (
		<svg
			viewBox={viewBox}
			className="h-5 max-w-28 text-white"
			preserveAspectRatio="xMidYMid meet"
			aria-hidden="true"
		>
			{data.paths.map((d: string) => (
				<path
					key={d}
					d={d}
					fill="none"
					stroke="currentColor"
					strokeWidth="1.75"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			))}
		</svg>
	);
}

function CoverFallback({ domain }: { domain: string }) {
	const letter = domain.charAt(0).toUpperCase();
	return (
		<div className="flex aspect-[16/9] items-center justify-center bg-gray-900 text-2xl text-gray-600">
			{letter}
		</div>
	);
}

export function BookmarkCard({
	item,
	signature,
}: {
	item: RaindropItem;
	signature: SignatureData;
}) {
	const [imgFailed, setImgFailed] = useState(false);
	const showCover = item.cover && !imgFailed;

	return (
		<a
			href={item.link}
			target="_blank"
			rel="noopener noreferrer"
			className={cn(
				"group flex flex-col border border-gray-800 transition-colors",
				"hover:border-gray-700 focus-visible:border-gray-700 focus:outline-none",
			)}
			data-sound="hover"
		>
			{showCover ? (
				<img
					src={item.cover}
					alt=""
					className="aspect-[16/9] w-full object-cover bg-gray-900"
					loading="lazy"
					onError={() => setImgFailed(true)}
				/>
			) : (
				<CoverFallback domain={item.domain} />
			)}

			<div className="flex flex-1 flex-col gap-1 p-3">
				<h3 className="text-sm font-medium text-white line-clamp-2 leading-tight">
					{item.title}
				</h3>
				<span className="flex items-center gap-1 text-xs text-gray-500">
					<ArrowUpRightIcon size={12} weight="bold" className="shrink-0" />
					{item.domain}
				</span>
				{item.excerpt ? (
					<p className="mt-1 text-xs text-gray-400 line-clamp-2 leading-relaxed">
						{item.excerpt}
					</p>
				) : null}

				{signature ? (
					<div className="mt-auto flex items-center gap-1.5 border-t border-gray-800/50 pt-2 text-xs text-gray-500">
						<span>submitted by</span>
						<Signature data={signature} />
					</div>
				) : null}
			</div>
		</a>
	);
}
