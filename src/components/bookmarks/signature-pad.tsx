"use client";

import { EraserIcon, PencilSimpleIcon, TextTIcon } from "@phosphor-icons/react";
import { useReducedMotion } from "motion/react";
import {
	type PointerEvent as ReactPointerEvent,
	useCallback,
	useRef,
	useState,
} from "react";
import type { SignatureData } from "@/lib/raindrop";
import { cn } from "@/utils/classNames";

type Mode = "draw" | "text";

const PAD_WIDTH = 400;
const PAD_HEIGHT = 120;
const SIGNATURE_MODE_STORAGE_KEY = "bookmark-signature-mode";

function getDefaultMode(): Mode {
	if (typeof window === "undefined") return "draw";

	try {
		const stored = localStorage.getItem(SIGNATURE_MODE_STORAGE_KEY);
		if (stored === "draw" || stored === "text") return stored;
	} catch {}

	const prefersReducedMotion = matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;
	const usesCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

	return prefersReducedMotion || usesCoarsePointer ? "text" : "draw";
}

function persistMode(next: Mode) {
	try {
		localStorage.setItem(SIGNATURE_MODE_STORAGE_KEY, next);
	} catch {}
}

function pointsToSvgPath(points: Array<[number, number]>): string {
	if (points.length < 2) return "";
	let d = `M${points[0][0]},${points[0][1]}`;
	for (let i = 1; i < points.length - 1; i++) {
		const cx = (points[i][0] + points[i + 1][0]) / 2;
		const cy = (points[i][1] + points[i + 1][1]) / 2;
		d += `Q${points[i][0]},${points[i][1]},${cx},${cy}`;
	}
	const last = points[points.length - 1];
	d += `L${last[0]},${last[1]}`;
	return d;
}

export function SignaturePad({
	onChange,
	holdProgress = 0,
}: {
	onChange: (data: SignatureData) => void;
	holdProgress?: number;
}) {
	const prefersReducedMotion = useReducedMotion();
	const [mode, setMode] = useState<Mode>(getDefaultMode);
	const [paths, setPaths] = useState<string[]>([]);
	const [previewPath, setPreviewPath] = useState("");
	const [textValue, setTextValue] = useState("");
	const canvasRef = useRef<SVGSVGElement>(null);
	const textInputRef = useRef<HTMLInputElement>(null);
	const currentPoints = useRef<Array<[number, number]>>([]);
	const isDrawing = useRef(false);
	const pathsRef = useRef(paths);
	pathsRef.current = paths;

	const getPoint = useCallback(
		(e: ReactPointerEvent<SVGSVGElement>): [number, number] => {
			const svg = canvasRef.current;
			if (!svg) return [0, 0];
			const rect = svg.getBoundingClientRect();
			const x = ((e.clientX - rect.left) / rect.width) * PAD_WIDTH;
			const y = ((e.clientY - rect.top) / rect.height) * PAD_HEIGHT;
			return [Math.round(x), Math.round(y)];
		},
		[],
	);

	const handlePointerDown = useCallback(
		(e: ReactPointerEvent<SVGSVGElement>) => {
			if (mode !== "draw") return;
			isDrawing.current = true;
			currentPoints.current = [getPoint(e)];
			e.currentTarget.setPointerCapture(e.pointerId);
		},
		[mode, getPoint],
	);

	const handlePointerMove = useCallback(
		(e: ReactPointerEvent<SVGSVGElement>) => {
			if (!isDrawing.current) return;
			currentPoints.current.push(getPoint(e));
			setPreviewPath(pointsToSvgPath(currentPoints.current));
		},
		[getPoint],
	);

	const handlePointerUp = useCallback(() => {
		if (!isDrawing.current) return;
		isDrawing.current = false;
		const path = pointsToSvgPath(currentPoints.current);
		if (path) {
			const next = [...pathsRef.current, path];
			setPaths(next);
			onChange({ type: "draw", paths: next });
		}
		currentPoints.current = [];
		setPreviewPath("");
	}, [onChange]);

	const handleClear = useCallback(() => {
		if (mode === "draw") {
			setPaths([]);
			onChange(null);
		} else {
			setTextValue("");
			onChange(null);
		}
	}, [mode, onChange]);

	const handleModeSwitch = useCallback(
		(next: Mode) => {
			setMode(next);
			persistMode(next);
			setPaths([]);
			setTextValue("");
			onChange(null);

			if (next === "text") {
				requestAnimationFrame(() => {
					textInputRef.current?.focus({ preventScroll: true });
				});
			}
		},
		[onChange],
	);

	const clampedHoldProgress = Math.max(0, Math.min(holdProgress, 1));
	const showHoldProgress =
		!prefersReducedMotion &&
		mode === "draw" &&
		clampedHoldProgress > 0 &&
		paths.length > 0;

	return (
		<div className="flex flex-col gap-2">
			<span className="text-xs text-gray-500">sign it (optional)</span>
			<div className="relative border border-gray-800 bg-gray-950">
				{mode === "draw" ? (
					<svg
						ref={canvasRef}
						viewBox={`0 0 ${PAD_WIDTH} ${PAD_HEIGHT}`}
						className="aspect-[10/3] w-full cursor-crosshair touch-none text-white"
						onPointerDown={handlePointerDown}
						onPointerMove={handlePointerMove}
						onPointerUp={handlePointerUp}
						onPointerCancel={handlePointerUp}
						aria-label="Signature drawing pad"
						role="img"
					>
						<defs>
							<pattern
								id="dot-grid"
								width="20"
								height="20"
								patternUnits="userSpaceOnUse"
							>
								<circle cx="10" cy="10" r="0.5" fill="var(--color-gray-700)" />
							</pattern>
						</defs>
						<rect width={PAD_WIDTH} height={PAD_HEIGHT} fill="url(#dot-grid)" />
						{showHoldProgress
							? paths.map((d, index) => (
									<path
										key={`ghost-${index}-${d}`}
										d={d}
										fill="none"
										stroke="currentColor"
										strokeOpacity="0.2"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								))
							: paths.map((d, index) => (
									<path
										key={`full-${index}-${d}`}
										d={d}
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								))}
						{showHoldProgress
							? paths.map((d, index) => {
									const segmentStart = index / paths.length;
									const segmentEnd = (index + 1) / paths.length;
									const segmentProgress = Math.max(
										0,
										Math.min(
											(clampedHoldProgress - segmentStart) /
												(segmentEnd - segmentStart),
											1,
										),
									);

									if (segmentProgress <= 0) return null;

									return (
										<path
											key={`progress-${index}-${d}`}
											d={d}
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											pathLength={1}
											strokeDasharray="1"
											strokeDashoffset={1 - segmentProgress}
										/>
									);
								})
							: null}
						<path
							d={previewPath}
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				) : (
					<div className="flex aspect-[10/3] items-center justify-center px-4">
						<input
							ref={textInputRef}
							type="text"
							value={textValue}
							onChange={(e) => {
								const val = e.target.value;
								setTextValue(val);
								onChange(val ? { type: "text", value: val } : null);
							}}
							placeholder="type your name"
							maxLength={40}
							className="w-full bg-transparent text-center font-serif text-lg italic text-white placeholder:text-gray-700 focus-visible:outline-none"
						/>
					</div>
				)}
			</div>
			<div
				className="flex items-center gap-2"
				role="toolbar"
				aria-label="Signature controls"
			>
				<button
					type="button"
					onClick={() => handleModeSwitch("draw")}
					className={cn(
						"border p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-500 focus-visible:ring-offset-1 focus-visible:ring-offset-black",
						mode === "draw"
							? "border-gray-700 text-white"
							: "border-gray-800 text-gray-600 hover:text-gray-400",
					)}
					aria-label="Draw mode"
					aria-pressed={mode === "draw"}
					data-sound="click"
				>
					<PencilSimpleIcon size={14} />
				</button>
				<button
					type="button"
					onClick={() => handleModeSwitch("text")}
					className={cn(
						"border p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-500 focus-visible:ring-offset-1 focus-visible:ring-offset-black",
						mode === "text"
							? "border-gray-700 text-white"
							: "border-gray-800 text-gray-600 hover:text-gray-400",
					)}
					aria-label="Type mode"
					aria-pressed={mode === "text"}
					data-sound="click"
				>
					<TextTIcon size={14} />
				</button>
				<button
					type="button"
					onClick={handleClear}
					className="border border-gray-800 p-1.5 text-gray-600 transition-colors hover:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-500 focus-visible:ring-offset-1 focus-visible:ring-offset-black"
					aria-label="Clear signature"
					data-sound="click"
				>
					<EraserIcon size={14} />
				</button>
			</div>
		</div>
	);
}
