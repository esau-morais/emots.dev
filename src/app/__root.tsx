import instrumentSerifItalicWoff2 from "@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2?url";
import instrumentSerifWoff2 from "@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2?url";
import jetbrainsMonoWoff2 from "@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2?url";
import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRoute,
	HeadContent,
	Link,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { Analytics } from "@vercel/analytics/react";
import type { ReactNode } from "react";
import { ConsoleGreeting } from "@/components/console-greeting";
import { CrashReportButton } from "@/components/crash-report-button";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { NarrationProvider } from "@/components/narration";
import { NotFoundPage } from "@/components/not-found";
import { SoundProvider } from "@/components/sound-provider";
import { SoundToggle } from "@/components/sound-toggle";
import { GhostAnimationProvider } from "@/contexts/ghost-animation";
import { MediaCoordinatorProvider } from "@/contexts/media-coordinator";
import { ThemeProvider } from "@/contexts/theme";
import { cn } from "@/utils/classNames";
import { description, ogImage, title, url } from "@/utils/consts";
import appCss from "./globals.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover",
			},
			{ title },
			{ name: "description", content: description },
			{ property: "og:locale", content: "en-UK" },
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: url },
			{ property: "og:title", content: title },
			{ property: "og:description", content: description },
			{ property: "og:image", content: ogImage },
			{ property: "og:image:width", content: "1600" },
			{ property: "og:image:height", content: "630" },
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:url", content: url },
			{ name: "twitter:title", content: title },
			{ name: "twitter:description", content: description },
			{ name: "twitter:image", content: ogImage },
			{
				name: "robots",
				content:
					"index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1",
			},
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "icon", href: "/favicon.ico" },
			{
				rel: "preload",
				href: jetbrainsMonoWoff2,
				as: "font",
				type: "font/woff2",
				crossOrigin: "anonymous",
			},
			{
				rel: "preload",
				href: instrumentSerifWoff2,
				as: "font",
				type: "font/woff2",
				crossOrigin: "anonymous",
			},
			{
				rel: "preload",
				href: instrumentSerifItalicWoff2,
				as: "font",
				type: "font/woff2",
				crossOrigin: "anonymous",
			},
		],
	}),
	shellComponent: RootShell,
	component: RootComponent,
	errorComponent: ErrorPage,
	notFoundComponent: NotFoundPage,
});

function RootShell({ children }: { children: ReactNode }) {
	return (
		<html
			lang="en"
			className="font-mono hide-scrollbar"
			suppressHydrationWarning
		>
			<head>
				<HeadContent />
			</head>
			<body
				className="relative min-h-dvh w-full overflow-x-hidden bg-black selection:bg-gray-800 selection:text-white text-white"
				suppressHydrationWarning
			>
				{children}
				<Analytics />
				<ConsoleGreeting />
				<Scripts />
				{import.meta.env.DEV && <TanStackDevtools />}
			</body>
		</html>
	);
}

function RootComponent() {
	return (
		<>
			<a
				href="#main-content"
				className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:z-100 focus-visible:bg-white focus-visible:px-4 focus-visible:py-2 focus-visible:text-black focus:outline-none"
			>
				Skip to content
			</a>
			<ThemeProvider>
				<MediaCoordinatorProvider>
					<SoundProvider>
						<GhostAnimationProvider>
							<NarrationProvider>
								<div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 md:px-8">
									<Header />
									<main
										id="main-content"
										className="my-20 min-h-[calc(100dvh-80px-160px)]"
									>
										<Outlet />
									</main>
								</div>
								<Footer>
									<span>emots.dev</span>
									<SoundToggle />
								</Footer>
							</NarrationProvider>
						</GhostAnimationProvider>
					</SoundProvider>
				</MediaCoordinatorProvider>
			</ThemeProvider>
		</>
	);
}

const FAKE_LOGS = [
	{ level: "INFO", message: "Application started" },
	{ level: "WARN", message: "Memory usage above threshold" },
	{ level: "ERROR", message: "Unhandled exception in render" },
	{ level: "ERROR", message: "Component tree unmounted unexpectedly" },
	{ level: "FATAL", message: "Process terminated" },
];

const getLevelColor = (level: string) => {
	switch (level) {
		case "INFO":
			return "text-blue-400";
		case "WARN":
			return "text-yellow-400";
		case "ERROR":
			return "text-red-400";
		case "FATAL":
			return "text-red-600";
		default:
			return "text-gray-400";
	}
};

function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
	return (
		<div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4">
			<h1 className="text-4xl md:text-5xl">
				Something{" "}
				<span className="font-serif italic text-error-fg">broke.</span>
			</h1>

			<div className="w-full max-w-md border border-error-border bg-error-bg p-4 font-mono text-xs">
				<span className="text-error-fg">[ERROR]</span>{" "}
				<span className="text-error-muted">
					{error.message || "Unknown error"}
				</span>
			</div>

			<div className="flex flex-col gap-3">
				<div className="flex gap-4">
					<button
						type="button"
						onClick={reset}
						className="flex-1 border border-gray-700 px-4 py-2 text-sm transition-colors hover:border-gray-500 hover:text-white focus:outline-none focus-visible:border-gray-500 focus-visible:text-white"
						data-sound="click"
					>
						retry
					</button>
					<Link
						to="/"
						className="flex-1 border border-gray-700 px-4 py-2 text-center text-sm transition-colors hover:border-gray-500 hover:text-white focus:outline-none focus-visible:border-gray-500 focus-visible:text-white"
					>
						home
					</Link>
				</div>
				<CrashReportButton errorMessage={error.message || "Unknown error"} />
			</div>

			<div className="w-full max-w-md mask-[linear-gradient(to_bottom,black_80%,transparent)]">
				<div className="border border-gray-800 bg-gray-900/50 p-4 font-mono text-xs">
					{FAKE_LOGS.map((log) => (
						<div key={`${log.level}-${log.message}`} className="flex gap-2">
							<span className={cn("w-[7ch]", getLevelColor(log.level))}>
								[{log.level}]
							</span>
							<span className="text-gray-400">{log.message}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
