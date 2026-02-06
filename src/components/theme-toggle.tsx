"use client";

import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useTheme } from "@/contexts/theme";

export const ThemeToggle = () => {
	const { theme, toggleTheme } = useTheme();

	return (
		<button
			type="button"
			onClick={toggleTheme}
			className="text-gray-600 transition-colors hover:text-gray-400 focus-visible:text-gray-400 focus:outline-none"
			aria-label={
				theme === "dark" ? "switch to light mode" : "switch to dark mode"
			}
		>
			{theme === "dark" ? (
				<SunIcon size={16} weight="fill" aria-hidden="true" />
			) : (
				<MoonIcon size={16} weight="fill" aria-hidden="true" />
			)}
		</button>
	);
};
