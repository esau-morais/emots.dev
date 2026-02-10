"use client";

import { Link, useLocation } from "@tanstack/react-router";
import {
	type CSSProperties,
	useCallback,
	useLayoutEffect,
	useRef,
} from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useWindowResize } from "@/hooks/use-window-resize";
import { cn } from "@/utils/classNames";

const NAV_ITEMS = [
	{ path: "/", label: "home" },
	{ path: "/work", label: "work" },
	{ path: "/blog", label: "blog" },
	{ path: "/craft", label: "craft" },
	{ path: "/bookmarks", label: "bookmarks" },
] as const;

export const Header = () => {
	const { pathname } = useLocation();
	const navRef = useRef<HTMLElement>(null);
	const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

	const activeIndex = NAV_ITEMS.findIndex((item) =>
		item.path === "/" ? pathname === "/" : pathname.startsWith(item.path),
	);

	const syncActiveNav = useCallback(
		(behavior: ScrollBehavior = "instant") => {
			const nav = navRef.current;
			const link = linkRefs.current[activeIndex];
			if (!nav) return;

			if (!link) {
				nav.style.setProperty("--pill-left", "0px");
				nav.style.setProperty("--pill-width", "0px");
				return;
			}

			nav.style.setProperty("--pill-left", `${link.offsetLeft}px`);
			nav.style.setProperty("--pill-width", `${link.offsetWidth}px`);

			if (nav.scrollWidth <= nav.clientWidth) return;
			const edgePadding = 16;
			const navLeft = nav.scrollLeft;
			const navRight = navLeft + nav.clientWidth;
			const linkLeft = link.offsetLeft;
			const linkRight = linkLeft + link.offsetWidth;
			const minVisibleLeft = navLeft + edgePadding;
			const maxVisibleRight = navRight - edgePadding;

			let targetLeft = navLeft;

			if (linkLeft < minVisibleLeft) {
				targetLeft = Math.max(0, linkLeft - edgePadding);
			} else if (linkRight > maxVisibleRight) {
				targetLeft = Math.min(
					nav.scrollWidth - nav.clientWidth,
					linkRight - nav.clientWidth + edgePadding,
				);
			} else {
				return;
			}

			if (Math.abs(nav.scrollLeft - targetLeft) <= 1) return;

			nav.scrollTo({ left: targetLeft, behavior });
		},
		[activeIndex],
	);

	useLayoutEffect(() => {
		syncActiveNav("instant");
	}, [syncActiveNav]);

	useWindowResize(
		useCallback(() => {
			syncActiveNav("instant");
		}, [syncActiveNav]),
	);

	return (
		<header
			className="fixed top-0 left-0 right-0 z-50 mx-auto flex h-10 max-w-3xl items-center border-b border-gray-800 bg-black/80 px-4 backdrop-blur-sm before:absolute before:left-4 before:-bottom-6 before:hidden before:h-6 before:w-px before:bg-gray-800 after:absolute after:right-4 after:-bottom-6 after:hidden after:h-6 after:w-px after:bg-gray-800 md:px-8 md:before:left-8 md:before:-bottom-8 md:before:block md:before:h-8 md:after:right-8 md:after:-bottom-8 md:after:block md:after:h-8"
			style={{ boxShadow: `0 20px 30px -10px var(--shadow-overlay)` }}
		>
			<nav
				ref={navRef}
				className="relative flex h-full min-w-0 flex-1 overflow-x-auto divide-x divide-gray-800 border-l border-gray-800 hide-scrollbar"
				style={{ "--pill-left": "0px", "--pill-width": "0px" } as CSSProperties}
			>
				{NAV_ITEMS.map((item, i) => (
					<Link
						key={item.label}
						ref={(el: HTMLAnchorElement | null) => {
							linkRefs.current[i] = el;
						}}
						className={cn(
							"relative z-10 flex shrink-0 touch-manipulation items-center px-4 text-white focus-visible:outline-none",
							i !== activeIndex &&
								"hover:bg-gray-900/50 focus-visible:bg-gray-900/50",
						)}
						to={item.path}
						preload="viewport"
						aria-current={i === activeIndex ? "page" : undefined}
					>
						{item.label}
					</Link>
				))}
				<span
					className="pointer-events-none absolute inset-y-0 bg-gray-800 transition-[left,width] duration-300 ease-out motion-reduce:transition-none"
					style={{ left: "var(--pill-left)", width: "var(--pill-width)" }}
				/>
			</nav>
			<div className="sticky right-0 flex h-full shrink-0 items-center pl-4 mask-[linear-gradient(to_right,transparent,black_8px)]">
				<ThemeToggle />
			</div>
		</header>
	);
};
