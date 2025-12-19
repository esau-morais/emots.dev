"use client";

import { useState } from "react";

import { cn } from "@/utils/classNames";

type ChecklistItem = {
	id: string;
	label: string;
	category: string;
};

const CHECKLIST_ITEMS: ChecklistItem[] = [
	// Performance - Critical
	{ id: "p1", label: "Keep page weight < 500KB", category: "Performance" },
	{ id: "p2", label: "Keep page load time < 3s", category: "Performance" },
	{ id: "p3", label: "Time To First Byte < 1.3s", category: "Performance" },
	{
		id: "p4",
		label: "Enable Brotli/GZIP compression",
		category: "Performance",
	},
	{
		id: "p5",
		label: "Minify JavaScript & CSS files",
		category: "Performance",
	},
	{ id: "p6", label: "Inline critical CSS", category: "Performance" },
	{
		id: "p7",
		label: "Use async/defer for non-critical JS",
		category: "Performance",
	},
	{
		id: "p8",
		label: "Deploy with CDN & HTTPS",
		category: "Performance",
	},

	// Images
	{
		id: "i1",
		label: "Set width/height for images (prevent CLS)",
		category: "Images",
	},
	{ id: "i2", label: "Lazy load offscreen images", category: "Images" },
	{
		id: "i3",
		label: "Use WebP/AVIF formats",
		category: "Images",
	},
	{
		id: "i4",
		label: "Serve images matching display size",
		category: "Images",
	},

	// Fonts
	{ id: "f1", label: "Use WOFF2 font format", category: "Fonts" },
	{ id: "f2", label: "Keep web font size < 300KB", category: "Fonts" },
	{ id: "f3", label: "Subset fonts to used characters", category: "Fonts" },
	{
		id: "f4",
		label: "Prevent Flash of Unstyled Text",
		category: "Fonts",
	},

	// Accessibility
	{
		id: "a1",
		label: "All flows keyboard-operable (WAI-ARIA)",
		category: "Accessibility",
	},
	{
		id: "a2",
		label: "Use :focus-visible for keyboard users",
		category: "Accessibility",
	},
	{
		id: "a3",
		label: "Touch targets ≥24px desktop / ≥44px mobile",
		category: "Accessibility",
	},
	{
		id: "a4",
		label: "Input font-size ≥16px on mobile (prevent zoom)",
		category: "Accessibility",
	},
	{
		id: "a5",
		label: "Respect prefers-reduced-motion",
		category: "Accessibility",
	},

	// Forms & Interactions
	{
		id: "fi1",
		label: "Enable Enter to submit single-input forms",
		category: "Forms",
	},
	{
		id: "fi2",
		label: "Keep submit enabled, validate on attempt",
		category: "Forms",
	},
	{
		id: "fi3",
		label: "Allow any input, validate & show feedback",
		category: "Forms",
	},
	{
		id: "fi4",
		label: "Target <500ms for POST/PATCH/DELETE",
		category: "Forms",
	},

	// Animations & Layout
	{
		id: "al1",
		label: "Use GPU-accelerated properties (transform, opacity)",
		category: "Animations",
	},
	{
		id: "al2",
		label: "Avoid transition: all",
		category: "Animations",
	},
	{
		id: "al3",
		label: "Only animate when clarifying cause-effect",
		category: "Animations",
	},
	{
		id: "al4",
		label: "Use flexbox/grid over JS measurements",
		category: "Layout",
	},

	// Content
	{
		id: "c1",
		label: "Use active voice in copy",
		category: "Content",
	},
	{
		id: "c2",
		label: "Frame errors positively with solutions",
		category: "Content",
	},
	{
		id: "c3",
		label: "Use proper typography (curly quotes, ellipsis)",
		category: "Content",
	},
];

const CATEGORIES = [
	"Performance",
	"Images",
	"Fonts",
	"Accessibility",
	"Forms",
	"Animations",
	"Layout",
	"Content",
];

export const Checklist = () => {
	const [checked, setChecked] = useState<Set<string>>(new Set());

	const toggleItem = (id: string) => {
		setChecked((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const toggleCategory = (category: string) => {
		const categoryItems = CHECKLIST_ITEMS.filter(
			(item) => item.category === category,
		);
		const allChecked = categoryItems.every((item) => checked.has(item.id));

		setChecked((prev) => {
			const next = new Set(prev);
			categoryItems.forEach((item) => {
				if (allChecked) {
					next.delete(item.id);
				} else {
					next.add(item.id);
				}
			});
			return next;
		});
	};

	const progress = Math.round((checked.size / CHECKLIST_ITEMS.length) * 100);

	return (
		<article className="mx-auto max-w-3xl px-6 py-20">
			<header className="mb-12">
				<h1 className="mb-4 font-mono text-4xl font-bold text-text">
					Web Guidelines Checklist
				</h1>
				<p className="mb-6 text-subtext0">
					Essential performance & accessibility guidelines for modern web
					development.
				</p>

				<section className="mb-4" aria-label="Progress tracker">
					<div className="mb-2 flex items-center justify-between text-sm">
						<span className="text-subtext1">Progress</span>
						<span className="font-mono text-rosewater" aria-live="polite">
							{checked.size}/{CHECKLIST_ITEMS.length} ({progress}%)
						</span>
					</div>
					<div
						className="h-2 w-full overflow-hidden rounded-full bg-surface0"
						role="progressbar"
						aria-valuenow={progress}
						aria-valuemin={0}
						aria-valuemax={100}
						aria-label="Checklist completion progress"
					>
						<div
							className="h-full bg-rosewater transition-all duration-300"
							style={{ width: `${progress}%` }}
						/>
					</div>
				</section>
			</header>

			<section className="space-y-8" aria-label="Checklist categories">
				{CATEGORIES.map((category) => {
					const items = CHECKLIST_ITEMS.filter(
						(item) => item.category === category,
					);
					const categoryProgress = items.filter((item) =>
						checked.has(item.id),
					).length;
					const allChecked = items.every((item) => checked.has(item.id));

					return (
						<section
							key={category}
							className="border-l-2 border-surface0 pl-6"
							aria-labelledby={`category-${category}`}
						>
							<button
								onClick={() => toggleCategory(category)}
								className="group mb-4 flex w-full items-center justify-between text-left transition-colors hover:text-rosewater"
								type="button"
								aria-label={`Toggle all ${category} items`}
							>
								<h2
									id={`category-${category}`}
									className="font-mono text-xl font-semibold text-text"
								>
									{category}
								</h2>
								<span className="font-mono text-sm text-subtext1">
									{categoryProgress}/{items.length}
									<span
										className={cn(
											"ml-2",
											allChecked ? "text-green" : "text-overlay0",
										)}
										aria-hidden="true"
									>
										{allChecked ? "✓" : "○"}
									</span>
								</span>
							</button>

							<ul className="space-y-3">
								{items.map((item) => {
									const isChecked = checked.has(item.id);
									return (
										<li key={item.id}>
											<label className="group flex cursor-pointer items-start gap-3 transition-colors hover:text-rosewater">
												<input
													type="checkbox"
													checked={isChecked}
													onChange={() => toggleItem(item.id)}
													className="mt-1 size-4 cursor-pointer appearance-none rounded border border-surface1 bg-mantle transition-all checked:border-rosewater checked:bg-rosewater focus-visible:ring-2 focus-visible:ring-rosewater focus-visible:ring-offset-2 focus-visible:ring-offset-base"
													aria-label={item.label}
												/>
												<span
													className={cn(
														"flex-1 text-sm",
														isChecked
															? "text-overlay0 line-through"
															: "text-text",
													)}
												>
													{item.label}
												</span>
											</label>
										</li>
									);
								})}
							</ul>
						</section>
					);
				})}
			</section>

			<footer className="mt-16 border-t border-surface0 pt-8">
				<h3 className="mb-4 font-mono text-sm font-semibold uppercase tracking-wider text-subtext1">
					Credits
				</h3>
				<div className="space-y-2 text-sm text-subtext0">
					<p>
						Guidelines adapted from{" "}
						<a
							href="https://vercel.com/design/guidelines"
							target="_blank"
							rel="noopener noreferrer"
							className="text-rosewater underline hover:text-pink"
						>
							Vercel Web Interface Guidelines
						</a>{" "}
						and{" "}
						<a
							href="https://roadmap.sh/frontend-performance-best-practices"
							target="_blank"
							rel="noopener noreferrer"
							className="text-rosewater underline hover:text-pink"
						>
							Frontend Performance Best Practices (roadmap.sh)
						</a>
						.
					</p>
					<p className="text-xs text-overlay0">
						Checklist state stored in browser memory only.
					</p>
				</div>
			</footer>
		</article>
	);
};
