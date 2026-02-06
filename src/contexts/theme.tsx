"use client";

import { ScriptOnce } from "@tanstack/react-router";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

type Theme = "light" | "dark";
type ThemePreference = Theme | "system";

interface ThemeContextValue {
	theme: Theme;
	preference: ThemePreference;
	setPreference: (pref: ThemePreference) => void;
	toggleTheme: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const STORAGE_KEY = "emots@theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

const themeScript = `(function(){try{var s=localStorage.getItem("${STORAGE_KEY}");var d=s==="light"||s==="dark"?s:(matchMedia("(prefers-color-scheme:light)").matches?"light":"dark");document.documentElement.classList.add(d);document.documentElement.style.colorScheme=d}catch(e){}})();`;

function getSystemTheme(): Theme {
	if (typeof window === "undefined") return "dark";
	return window.matchMedia("(prefers-color-scheme: light)").matches
		? "light"
		: "dark";
}

function resolveTheme(pref: ThemePreference): Theme {
	return pref === "system" ? getSystemTheme() : pref;
}

function applyTheme(theme: Theme) {
	const root = document.documentElement;
	root.classList.remove("light", "dark");
	root.classList.add(theme);
	root.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [preference, setPreferenceState] = useState<ThemePreference>("system");
	const [theme, setThemeState] = useState<Theme>("dark");

	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
		const pref = stored ?? "system";
		const resolved = resolveTheme(pref);
		setPreferenceState(pref);
		setThemeState(resolved);
		applyTheme(resolved);
	}, []);

	useEffect(() => {
		if (preference !== "system") return;

		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const handler = () => {
			const resolved = getSystemTheme();
			setThemeState(resolved);
			applyTheme(resolved);
		};
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, [preference]);

	const setPreference = useCallback((pref: ThemePreference) => {
		localStorage.setItem(STORAGE_KEY, pref);
		setPreferenceState(pref);
		const resolved = resolveTheme(pref);
		setThemeState(resolved);
		applyTheme(resolved);
	}, []);

	const toggleTheme = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			const next: Theme = theme === "dark" ? "light" : "dark";
			const { clientX: x, clientY: y } = event;

			const apply = () => setPreference(next);

			if (
				!document.startViewTransition ||
				window.matchMedia("(prefers-reduced-motion: reduce)").matches
			) {
				apply();
				return;
			}

			const root = document.documentElement;
			const w = window.innerWidth;
			const h = window.innerHeight;
			root.style.setProperty("--inset-top", `${y}px`);
			root.style.setProperty("--inset-right", `${w - x}px`);
			root.style.setProperty("--inset-bottom", `${h - y}px`);
			root.style.setProperty("--inset-left", `${x}px`);
			document.startViewTransition(apply);
		},
		[theme, setPreference],
	);

	const value = useMemo(
		() => ({ theme, preference, setPreference, toggleTheme }),
		[theme, preference, setPreference, toggleTheme],
	);

	return (
		<ThemeContext.Provider value={value}>
			<ScriptOnce>{themeScript}</ScriptOnce>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
	return ctx;
}
