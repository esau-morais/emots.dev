"use client";

import { useState } from "react";

import { CATEGORIES, CHECKLIST_ITEMS } from "@/lib/checklist-data";
import { cn } from "@/utils/classNames";

export const InteractiveChecklist = () => {
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
		<>
			<section className="mb-4" aria-label="Progress tracker">
				<div className="mb-2 flex items-center justify-between text-sm">
					<span className="text-subtext1">Progress</span>
					<span className="font-mono text-rosewater" aria-live="polite">
						{checked.size}/{CHECKLIST_ITEMS.length} ({progress}%)
					</span>
				</div>
				<div
					className="h-2 w-full overflow-hidden rounded-full bg-ctp-surface0"
					role="progressbar"
					aria-valuenow={progress}
					aria-valuemin={0}
					aria-valuemax={100}
					aria-label="Checklist completion progress"
				>
					<div
						className="h-full bg-ctp-rosewater transition-all duration-300"
						style={{ width: `${progress}%` }}
					/>
				</div>
			</section>

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
							className="border-l-2 border-ctp-surface0 pl-6"
							aria-labelledby={`category-${category}`}
						>
							<button
								onClick={() => toggleCategory(category)}
								className="group mb-4 flex w-full items-center justify-between text-left transition-colors hover:text-ctp-rosewater"
								type="button"
								aria-label={`Toggle all ${category} items`}
							>
								<h2
									id={`category-${category}`}
									className="font-mono text-xl font-semibold text-ctp-text"
								>
									{category}
								</h2>
								<span className="font-mono text-sm text-ctp-subtext1">
									{categoryProgress}/{items.length}
									<span
										className={cn(
											"ml-2",
											allChecked ? "text-ctp-green" : "text-ctp-overlay0",
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
											<label className="group flex cursor-pointer items-start gap-3 transition-colors hover:text-ctp-rosewater">
												<input
													type="checkbox"
													checked={isChecked}
													onChange={() => toggleItem(item.id)}
													className="mt-1 size-4 cursor-pointer appearance-none rounded border border-ctp-surface1 bg-ctp-mantle transition-all checked:border-ctp-rosewater checked:bg-ctp-rosewater focus-visible:ring-2 focus-visible:ring-rosewater focus-visible:ring-offset-2 focus-visible:ring-offset-base"
													aria-label={item.label}
												/>
												<span
													className={cn(
														"flex-1 text-sm",
														isChecked
															? "text-ctp-overlay0 line-through"
															: "text-ctp-text",
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
		</>
	);
};
