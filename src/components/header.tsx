"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
	{
		path: "/",
		label: "home",
	},
	{
		path: "/work",
		label: "work",
	},
] as const;

export const Header = () => {
	const path = usePathname();

	return (
		<header className="sticky top-0 flex h-10 items-center justify-between border-b border-ctp-surface0 bg-ctp-base/80 backdrop-blur-sm">
			<nav className="flex size-full divide-x">
				{NAV_ITEMS.map((item) => (
					<Link
						key={item.label}
						className="flex items-center border-ctp-surface0 px-4 text-ctp-text last:border-r! hover:bg-ctp-crust focus:bg-ctp-crust focus:outline-none data-[active=true]:bg-ctp-crust"
						href={item.path}
						data-active={path === item.path}
					>
						{item.label}
					</Link>
				))}
			</nav>
		</header>
	);
};
