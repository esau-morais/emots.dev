"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sounds } from "@/lib/sounds";
import { cn } from "@/utils/classNames";

const HOLD_DURATION = 800;
const CANCEL_DURATION_SCALE = 0.45;

const linear = (t: number) => t;
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

export function HoldButton({
	onComplete,
	disabled,
	label = "hold to submit",
	onProgressChange,
}: {
	onComplete: () => boolean | Promise<boolean>;
	disabled?: boolean;
	label?: string;
	onProgressChange?: (progress: number) => void;
}) {
	const [progress, setProgress] = useState(0);
	const [holding, setHolding] = useState(false);
	const frameRef = useRef<number | null>(null);
	const progressRef = useRef(0);
	const toneRef = useRef<{ stop: () => void }>(null);

	const updateProgress = useCallback(
		(next: number) => {
			progressRef.current = next;
			setProgress(next);
			onProgressChange?.(next);
		},
		[onProgressChange],
	);

	const stopAnimation = useCallback(() => {
		if (frameRef.current !== null) {
			cancelAnimationFrame(frameRef.current);
			frameRef.current = null;
		}
	}, []);

	const animateTo = useCallback(
		(
			target: number,
			onDone?: () => void,
			options?: {
				durationScale?: number;
				easing?: (t: number) => number;
			},
		) => {
			stopAnimation();
			const from = progressRef.current;
			if (from === target) {
				onDone?.();
				return;
			}

			const durationScale = options?.durationScale ?? 1;
			const easing = options?.easing ?? linear;
			const duration = HOLD_DURATION * Math.abs(target - from) * durationScale;
			if (duration === 0) {
				updateProgress(target);
				onDone?.();
				return;
			}

			const startedAt = performance.now();
			const tick = (now: number) => {
				const elapsed = now - startedAt;
				const t = Math.min(elapsed / duration, 1);
				updateProgress(from + (target - from) * easing(t));

				if (t < 1) {
					frameRef.current = requestAnimationFrame(tick);
					return;
				}

				frameRef.current = null;
				onDone?.();
			};

			frameRef.current = requestAnimationFrame(tick);
		},
		[stopAnimation, updateProgress],
	);

	useEffect(() => {
		return () => {
			stopAnimation();
			toneRef.current?.stop();
		};
	}, [stopAnimation]);

	const start = useCallback(() => {
		if (disabled) return;
		setHolding(true);
		stopAnimation();
		toneRef.current?.stop();
		toneRef.current = sounds.holdTone();

		animateTo(1, () => {
			toneRef.current?.stop();
			toneRef.current = null;
			setHolding(false);
			updateProgress(0);
			void Promise.resolve(onComplete())
				.then((ok) => {
					if (ok) {
						sounds.submitDing();
						return;
					}
					sounds.submitBlocked();
				})
				.catch(() => {
					sounds.submitBlocked();
				});
		});
	}, [animateTo, disabled, onComplete, stopAnimation, updateProgress]);

	const cancel = useCallback(() => {
		stopAnimation();
		const current = progressRef.current;

		if (holding && current > 0 && current < 1) {
			sounds.holdRelease();
		}

		toneRef.current?.stop();
		toneRef.current = null;
		setHolding(false);

		if (current > 0 && current < 1) {
			animateTo(0, undefined, {
				durationScale: CANCEL_DURATION_SCALE,
				easing: easeOutCubic,
			});
			return;
		}

		if (current !== 0) {
			updateProgress(0);
		}
	}, [animateTo, holding, stopAnimation, updateProgress]);

	return (
		<button
			type="button"
			onPointerDown={start}
			onPointerUp={cancel}
			onPointerLeave={cancel}
			onPointerCancel={cancel}
			onKeyDown={(e) => {
				if (e.repeat) return;
				if (e.key === " " || e.key === "Enter") {
					e.preventDefault();
					start();
				}
			}}
			onKeyUp={(e) => {
				if (e.key === " " || e.key === "Enter") cancel();
			}}
			disabled={disabled}
			className={cn(
				"relative w-full overflow-hidden border py-2.5 text-sm transition-colors select-none focus:outline-none",
				disabled
					? "cursor-not-allowed border-gray-800 text-gray-600"
					: "cursor-pointer border-gray-700 text-white hover:border-gray-600 focus-visible:border-gray-600",
			)}
			aria-label={label}
		>
			<span
				className="absolute inset-y-0 left-0 bg-gray-800 transition-none"
				style={{ width: `${progress * 100}%` }}
			/>
			<span className="relative">{label}</span>
		</button>
	);
}
