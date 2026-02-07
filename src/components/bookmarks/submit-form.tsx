"use client";

import { CaretDownIcon, MinusIcon, PlusIcon } from "@phosphor-icons/react";
import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RaindropCollection, SignatureData } from "@/lib/raindrop";
import { cn } from "@/utils/classNames";
import { HoldButton } from "./hold-button";
import { SignaturePad } from "./signature-pad";

type SubmitState = "idle" | "submitting" | "success" | "error";

function hasUserSignature(signature: SignatureData): boolean {
	if (!signature || signature.type === "anonymous") return false;
	if (signature.type === "draw") return signature.paths.length > 0;
	return signature.value.trim().length > 0;
}

function isValidUrl(value: string): boolean {
	try {
		const parsed = new URL(value);
		return parsed.protocol === "http:" || parsed.protocol === "https:";
	} catch {
		return false;
	}
}

export function SubmitForm({
	collections,
}: {
	collections: RaindropCollection[];
}) {
	const [open, setOpen] = useState(false);
	const [url, setUrl] = useState("");
	const [category, setCategory] = useState("");
	const [signature, setSignature] = useState<SignatureData>(null);
	const [holdProgress, setHoldProgress] = useState(0);
	const [state, setState] = useState<SubmitState>("idle");
	const [errorMsg, setErrorMsg] = useState("");
	const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
	const [urlTouched, setUrlTouched] = useState(false);
	const [categoryTouched, setCategoryTouched] = useState(false);
	const prefersReducedMotion = useReducedMotion();
	const detailsRef = useRef<HTMLDetailsElement>(null);
	const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
	const urlInputRef = useRef<HTMLInputElement>(null);
	const categorySelectRef = useRef<HTMLSelectElement>(null);

	useEffect(() => {
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, []);

	const isValid = isValidUrl(url);
	const hasCategory = category.trim().length > 0;
	const hasSignature = hasUserSignature(signature);
	const useHoldToSubmit = hasSignature && !prefersReducedMotion;
	const urlInvalid = !isValid;
	const categoryInvalid = !hasCategory;
	const showUrlError = (hasTriedSubmit || urlTouched) && urlInvalid;
	const showCategoryError =
		(hasTriedSubmit || categoryTouched) && categoryInvalid;
	const hasVisibleValidationError = showUrlError || showCategoryError;
	const isSubmitDisabled = state === "submitting" || hasVisibleValidationError;

	useEffect(() => {
		if (!useHoldToSubmit && holdProgress !== 0) {
			setHoldProgress(0);
		}
	}, [holdProgress, useHoldToSubmit]);

	const handleToggle = useCallback(() => {
		const isOpen = !!detailsRef.current?.open;
		setOpen(isOpen);
		if (!isOpen && state === "success") {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
			setState("idle");
		}
	}, [state]);

	const handleSubmit = useCallback(async (): Promise<boolean> => {
		setHasTriedSubmit(true);

		if (urlInvalid || categoryInvalid) {
			if (urlInvalid) {
				urlInputRef.current?.focus();
				return false;
			}

			if (categoryInvalid) {
				categorySelectRef.current?.focus();
			}

			return false;
		}

		setState("submitting");
		setErrorMsg("");

		try {
			const res = await fetch("/api/bookmarks/submit", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ url, category, signature }),
			});

			if (!res.ok) {
				const data = (await res.json()) as { error?: string };
				throw new Error(data.error ?? "failed to submit");
			}

			setState("success");
			setUrl("");
			setCategory("");
			setSignature(null);
			setHasTriedSubmit(false);
			setUrlTouched(false);
			setCategoryTouched(false);
			setHoldProgress(0);
			timerRef.current = setTimeout(() => {
				if (detailsRef.current) {
					detailsRef.current.open = false;
					setOpen(false);
				}
			}, 3000);
			return true;
		} catch (err) {
			setState("error");
			setHoldProgress(0);
			setErrorMsg(err instanceof Error ? err.message : "something went wrong");
			timerRef.current = setTimeout(() => setState("idle"), 4000);
			return true;
		}
	}, [url, category, signature, urlInvalid, categoryInvalid]);

	return (
		<details
			ref={detailsRef}
			className="disclosure flex flex-col gap-3"
			onToggle={handleToggle}
		>
			<summary
				className="flex cursor-pointer items-center gap-1.5 self-start text-xs text-gray-500 transition-colors hover:text-gray-200 focus:outline-none focus-visible:text-gray-200"
				data-sound="click"
			>
				{open ? (
					<MinusIcon size={12} weight="bold" />
				) : (
					<PlusIcon size={12} weight="bold" />
				)}
				submit a bookmark
			</summary>

			<div className="flex flex-col gap-4 border border-gray-800 p-4">
				<p className="text-xs text-gray-500">
					share a link you find useful. if it fits, it ships.
				</p>

				<div aria-live="polite" aria-atomic="true">
					{state === "success" ? (
						<div className="border border-success-border bg-success-bg px-3 py-2 text-xs text-success-fg">
							submitted! i'll review it soon.
						</div>
					) : state === "error" ? (
						<div className="border border-red-900/50 bg-red-950/20 px-3 py-2 text-xs text-red-400">
							{errorMsg}
						</div>
					) : null}
				</div>

				{state === "success" ? null : (
					<>
						<label className="flex flex-col gap-1.5">
							<span className="flex items-baseline justify-between gap-2 text-xs">
								<span className="text-gray-500">url</span>
								{showUrlError ? (
									<span id="bookmark-url-error" className="text-red-400">
										enter a valid http[s] url.
									</span>
								) : null}
							</span>
							<input
								ref={urlInputRef}
								name="url"
								type="url"
								value={url}
								onChange={(e) => {
									setUrl(e.target.value);
									if (state === "error") {
										setState("idle");
										setErrorMsg("");
									}
								}}
								onBlur={() => setUrlTouched(true)}
								placeholder="https://example.com"
								className="border border-gray-800 bg-transparent px-3 py-2 text-sm text-white placeholder:text-gray-700 focus:border-gray-700 focus:outline-none"
								autoComplete="url"
								inputMode="url"
								aria-invalid={showUrlError}
								aria-describedby={
									showUrlError ? "bookmark-url-error" : undefined
								}
							/>
						</label>

						<label className="flex flex-col gap-1.5">
							<span className="flex items-baseline justify-between gap-2 text-xs">
								<span className="text-gray-500">category</span>
								{showCategoryError ? (
									<span id="bookmark-category-error" className="text-red-400">
										choose a category.
									</span>
								) : null}
							</span>
							<div className="relative">
								<select
									ref={categorySelectRef}
									name="category"
									required
									value={category}
									onChange={(e) => {
										setCategory(e.target.value);
										if (state === "error") {
											setState("idle");
											setErrorMsg("");
										}
									}}
									onBlur={() => setCategoryTouched(true)}
									className={cn(
										"w-full appearance-none border border-gray-800 bg-transparent px-3 py-2 pr-8 text-sm focus:border-gray-700 focus:outline-none",
										category ? "text-white" : "text-gray-700",
									)}
									aria-invalid={showCategoryError}
									aria-describedby={
										showCategoryError ? "bookmark-category-error" : undefined
									}
								>
									<option value="" className="bg-gray-950 text-white">
										select a category...
									</option>
									{collections.map((c) => (
										<option
											key={c._id}
											value={String(c._id)}
											className="bg-gray-950 text-white"
										>
											{c.title.toLowerCase()}
										</option>
									))}
								</select>
								<CaretDownIcon
									size={14}
									className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-600"
								/>
							</div>
						</label>

						<SignaturePad
							onChange={setSignature}
							holdProgress={useHoldToSubmit ? holdProgress : 0}
						/>

						<p className="sr-only" aria-live="polite">
							{hasSignature
								? prefersReducedMotion
									? "signature added. submit is instant because reduced motion is on."
									: "signature added. hold to confirm submission."
								: "no signature added. this will submit as anonymous."}
						</p>

						{useHoldToSubmit ? (
							<HoldButton
								onComplete={handleSubmit}
								onProgressChange={setHoldProgress}
								disabled={isSubmitDisabled}
								label={
									state === "submitting"
										? "submitting…"
										: "hold to submit signed"
								}
							/>
						) : (
							<button
								type="button"
								onClick={handleSubmit}
								disabled={isSubmitDisabled}
								className={cn(
									"w-full border py-2.5 text-sm transition-colors select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-500 focus-visible:ring-offset-1 focus-visible:ring-offset-black",
									isSubmitDisabled
										? "cursor-not-allowed border-gray-800 text-gray-600"
										: "cursor-pointer border-gray-700 text-white hover:border-gray-600 focus-visible:border-gray-600",
								)}
							>
								{state === "submitting"
									? "submitting…"
									: hasSignature
										? "submit signed"
										: "submit anonymously"}
							</button>
						)}
					</>
				)}
			</div>
		</details>
	);
}
