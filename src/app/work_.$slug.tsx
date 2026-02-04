import {
	ArrowLeftIcon,
	ArrowSquareOutIcon,
} from "@phosphor-icons/react/dist/ssr";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { allWorks } from "content-collections";
import { GitHubIcon } from "@/components/icons";
import { MDXProvider } from "@/components/mdx-provider";
import { BASE_URL } from "@/utils/consts";

type WorkMeta = {
	slug: string;
	title: string;
	description: string;
	date: string;
	type: "project" | "design" | "experiment";
	cover?: string;
	stack?: string[];
	links?: {
		live?: string;
		github?: string;
	};
};

function getWorkMeta(slug: string): WorkMeta | undefined {
	const work = allWorks.find((w) => w.slug === slug);
	if (!work) return undefined;
	return {
		slug: work.slug,
		title: work.title,
		description: work.description,
		date: work.date,
		type: work.type,
		cover: work.cover,
		stack: work.stack,
		links: work.links,
	};
}

export const Route = createFileRoute("/work_/$slug")({
	staleTime: 1000 * 60 * 5,
	loader: ({ params }) => {
		const meta = getWorkMeta(params.slug);
		if (!meta) throw notFound();
		return meta;
	},
	head: ({ loaderData }) => {
		if (!loaderData) return { meta: [{ title: "not found" }] };
		const work = loaderData;
		const ogImage = `${BASE_URL}/api/og?title=${encodeURIComponent(work.title)}`;
		return {
			meta: [
				{ title: `${work.title} | Esaú Morais` },
				{ name: "description", content: work.description },
				{ property: "og:title", content: work.title },
				{ property: "og:description", content: work.description },
				{ property: "og:url", content: `${BASE_URL}/work/${work.slug}` },
				{ property: "og:type", content: "website" },
				{ property: "og:image", content: ogImage },
				{ property: "og:image:width", content: "1920" },
				{ property: "og:image:height", content: "1080" },
				{ name: "twitter:card", content: "summary_large_image" },
				{ name: "twitter:url", content: `${BASE_URL}/work/${work.slug}` },
				{ name: "twitter:title", content: work.title },
				{ name: "twitter:description", content: work.description },
				{ name: "twitter:image", content: ogImage },
			],
		};
	},
	component: SingleWorkPage,
});

function SingleWorkPage() {
	const meta = Route.useLoaderData();
	const work = allWorks.find((w) => w.slug === meta.slug);
	if (!work) throw new Error(`Work not found: ${meta.slug}`);
	const Content = work.Content;

	return (
		<div className="mx-auto max-w-2xl px-6">
			<Link
				to="/work"
				className="mb-8 inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-white"
			>
				<ArrowLeftIcon size={14} />
				<span>back to work</span>
			</Link>

			<header className="mb-8">
				<div className="flex items-center gap-3">
					<h1 className="text-2xl font-bold text-white">{meta.title}</h1>
					<span className="bg-gray-900 px-2 py-1 text-[10px] uppercase tracking-wider text-gray-500">
						{meta.type}
					</span>
				</div>
				<p className="mt-2 text-gray-500">{meta.description}</p>
				<div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
					<time dateTime={meta.date} className="text-sm text-gray-600">
						{new Date(meta.date).getFullYear()}
					</time>
					{meta.links?.live && (
						<a
							href={meta.links.live}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-white"
						>
							<ArrowSquareOutIcon size={14} />
							<span>live</span>
						</a>
					)}
					{meta.links?.github && (
						<a
							href={meta.links.github}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-white"
						>
							<GitHubIcon size={14} />
							<span>source</span>
						</a>
					)}
				</div>
				{meta.stack && meta.stack.length > 0 && (
					<div className="mt-4 flex flex-wrap gap-1.5">
						{meta.stack.map((item) => (
							<span
								key={item}
								className="bg-gray-900 px-2 py-1 text-xs text-gray-500"
							>
								{item}
							</span>
						))}
					</div>
				)}
			</header>

			<article className="prose-custom">
				<MDXProvider>
					<Content />
				</MDXProvider>
			</article>
		</div>
	);
}
