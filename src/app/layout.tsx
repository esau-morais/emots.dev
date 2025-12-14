import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { cn } from "@/utils/classNames";
import { description, ogImage, title, url } from "@/utils/consts";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { GeistMono } from "geist/font/mono";

export const metadata: Metadata = {
	title: {
		default: title,
		template: "%s | Esaú Morais",
	},
	description,
	openGraph: {
		locale: "en-UK",
		type: "website",
		url: url,
		title: title,
		description: description,
		images: { url: ogImage, width: 1600, height: 630 },
	},
	twitter: {
		card: "summary_large_image",
		title: title,
		description: description,
		images: {
			url: ogImage,
			width: 1600,
			height: 630,
		},
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	icons: {
		shortcut: "/favicon.ico",
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	viewportFit: "cover",
};

const RootLayout = ({ children }: { children: ReactNode }) => {
	return (
		<html
			lang="en"
			className={cn(GeistMono.variable, "font-mono")}
			suppressHydrationWarning
		>
			<head />
			<body className="relative min-h-dvh w-full bg-ctp-mantle text-ctp-text">
				<Header />
				<main className="my-20 min-h-[calc(100dvh-80px-160px)]">
					{children}
				</main>
				<Footer />
				<Toaster />
				<Analytics />
			</body>
		</html>
	);
};

export default RootLayout;
