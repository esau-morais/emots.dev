"use client";

import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { useGhostAnimation } from "@/contexts/ghost-animation";
import { useWindowResize } from "@/lib/hooks/window-resize";
import { cn } from "@/utils/classNames";

export const CustomScrollbar = () => {
	const { phase: ghostPhase } = useGhostAnimation();
	const isGhostActive = ghostPhase !== "idle";
	const trackRef = useRef<HTMLDivElement>(null);
	const thumbRef = useRef<HTMLDivElement>(null);
	const thumbHeightRef = useRef(0);
	const [isScrollable, setIsScrollable] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [isActive, setIsActive] = useState(false);
	const dragStartY = useRef(0);
	const dragStartScroll = useRef(0);
	const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

	const updateThumb = useCallback(() => {
		const doc = document.documentElement;
		const viewportHeight = window.innerHeight;
		const contentHeight = doc.scrollHeight;

		if (contentHeight <= viewportHeight) {
			thumbHeightRef.current = 0;
			setIsScrollable(false);
			return;
		}

		setIsScrollable(true);

		const thumb = thumbRef.current;
		const track = trackRef.current;
		if (!thumb || !track) return;

		const trackHeight = track.clientHeight;
		const ratio = viewportHeight / contentHeight;
		const newThumbHeight = Math.max(ratio * trackHeight, 32);
		const scrollRatio = doc.scrollTop / (contentHeight - viewportHeight);
		const maxThumbTop = trackHeight - newThumbHeight;

		thumbHeightRef.current = newThumbHeight;
		thumb.style.height = `${newThumbHeight}px`;
		thumb.style.top = `${scrollRatio * maxThumbTop}px`;
	}, []);

	const showScrollbar = useCallback(() => {
		setIsActive(true);
		if (hideTimeout.current) clearTimeout(hideTimeout.current);
		hideTimeout.current = setTimeout(() => {
			if (!isDragging) setIsActive(false);
		}, 1000);
	}, [isDragging]);

	useLayoutEffect(() => {
		if (isScrollable) updateThumb();
	}, [isScrollable, updateThumb]);

	useWindowResize(updateThumb);

	useEffect(() => {
		const handleScroll = () => {
			updateThumb();
			showScrollbar();
		};

		window.addEventListener("scroll", handleScroll, { passive: true });

		const observer = new ResizeObserver(updateThumb);
		observer.observe(document.body);

		return () => {
			window.removeEventListener("scroll", handleScroll);
			observer.disconnect();
			if (hideTimeout.current) clearTimeout(hideTimeout.current);
		};
	}, [updateThumb, showScrollbar]);

	const scrollToPosition = useCallback((clientY: number) => {
		const track = trackRef.current;
		if (!track) return;

		const rect = track.getBoundingClientRect();
		const clickY = clientY - rect.top;
		const trackHeight = rect.height;
		const ratio = Math.max(0, Math.min(1, clickY / trackHeight));

		const doc = document.documentElement;
		const maxScroll = doc.scrollHeight - window.innerHeight;
		window.scrollTo({ top: ratio * maxScroll, behavior: "smooth" });
	}, []);

	const handleTrackPointerDown = useCallback(
		(e: React.PointerEvent) => {
			if (e.target === thumbRef.current) return;
			e.preventDefault();
			scrollToPosition(e.clientY);
		},
		[scrollToPosition],
	);

	const handleThumbPointerDown = useCallback((e: React.PointerEvent) => {
		e.preventDefault();
		e.stopPropagation();
		e.currentTarget.setPointerCapture(e.pointerId);
		setIsDragging(true);
		dragStartY.current = e.clientY;
		dragStartScroll.current = document.documentElement.scrollTop;
	}, []);

	const handleThumbPointerMove = useCallback(
		(e: React.PointerEvent) => {
			if (!isDragging) return;
			const track = trackRef.current;
			if (!track) return;

			const deltaY = e.clientY - dragStartY.current;
			const trackHeight = track.clientHeight;
			const contentHeight = document.documentElement.scrollHeight;
			const viewportHeight = window.innerHeight;
			const scrollableHeight = contentHeight - viewportHeight;
			const thumbHeight = thumbHeightRef.current;
			const scrollDelta =
				(deltaY / (trackHeight - thumbHeight)) * scrollableHeight;

			window.scrollTo({
				top: dragStartScroll.current + scrollDelta,
				behavior: "instant",
			});
		},
		[isDragging],
	);

	const handleThumbPointerUp = useCallback(
		(e: React.PointerEvent) => {
			e.currentTarget.releasePointerCapture(e.pointerId);
			setIsDragging(false);
			showScrollbar();
		},
		[showScrollbar],
	);

	const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const startScrolling = useCallback((direction: "up" | "down") => {
		const step = direction === "up" ? -40 : 40;
		window.scrollBy({ top: step });
		scrollIntervalRef.current = setInterval(() => {
			window.scrollBy({ top: step });
		}, 50);
	}, []);

	const stopScrolling = useCallback(() => {
		if (scrollIntervalRef.current) {
			clearInterval(scrollIntervalRef.current);
			scrollIntervalRef.current = null;
		}
	}, []);

	useEffect(() => {
		return () => stopScrolling();
	}, [stopScrolling]);

	useEffect(() => {
		if (isDragging) {
			document.body.classList.add("cursor-grabbing", "select-none");
		} else {
			document.body.classList.remove("cursor-grabbing", "select-none");
		}

		return () => {
			document.body.classList.remove("cursor-grabbing", "select-none");
		};
	}, [isDragging]);

	if (!isScrollable || isGhostActive) return null;

	return (
		<nav
			aria-label="Page scroll"
			onMouseEnter={() => setIsActive(true)}
			onMouseLeave={() => {
				if (!isDragging) setIsActive(false);
				stopScrolling();
			}}
			className="fixed right-0 top-0 z-50 flex h-full w-5 flex-col pr-2"
			style={{
				opacity: isActive || isDragging ? 1 : 0.5,
				transition: "opacity 0.2s",
			}}
		>
			<button
				type="button"
				aria-label="Scroll up"
				onPointerDown={() => startScrolling("up")}
				onPointerUp={stopScrolling}
				onPointerLeave={stopScrolling}
				onPointerCancel={stopScrolling}
				className="flex h-5 w-full shrink-0 items-center justify-end bg-black text-gray-500 transition-colors hover:text-gray-400 focus:outline-none focus-visible:text-white active:text-white touch-none"
			>
				<span className="flex w-2 justify-center" aria-hidden="true">
					<CaretUpIcon size={10} weight="bold" />
				</span>
			</button>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: supplementary pointer interaction */}
			<div
				ref={trackRef}
				onPointerDown={handleTrackPointerDown}
				className="relative w-full flex-1 cursor-pointer bg-black touch-none"
			>
				{/* biome-ignore lint/a11y/noStaticElementInteractions: pointer-only drag interaction */}
				<div
					ref={thumbRef}
					onPointerDown={handleThumbPointerDown}
					onPointerMove={handleThumbPointerMove}
					onPointerUp={handleThumbPointerUp}
					onPointerCancel={handleThumbPointerUp}
					className={cn(
						"absolute right-0 w-2 transition-colors touch-none",
						isDragging
							? "bg-gray-400 cursor-grabbing"
							: "bg-gray-600 hover:bg-gray-500 cursor-grab",
					)}
				/>
			</div>
			<button
				type="button"
				aria-label="Scroll down"
				onPointerDown={() => startScrolling("down")}
				onPointerUp={stopScrolling}
				onPointerLeave={stopScrolling}
				onPointerCancel={stopScrolling}
				className="flex h-5 w-full shrink-0 items-center justify-end bg-black text-gray-500 transition-colors hover:text-gray-400 focus:outline-none focus-visible:text-white active:text-white touch-none"
			>
				<span className="flex w-2 justify-center" aria-hidden="true">
					<CaretDownIcon size={10} weight="bold" />
				</span>
			</button>
		</nav>
	);
};
