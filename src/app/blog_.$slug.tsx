import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { allPosts, type Post } from "content-collections";
import { format } from "date-fns";
import { MDXProvider } from "@/components/mdx-provider";
import { NarrationPlayButton } from "@/components/narration";
import { BASE_URL } from "@/utils/consts";

type PostMeta = Omit<Post, "Content">;

function getPostMeta(slug: string): PostMeta | undefined {
	const post = allPosts.find((p) => p.slug === slug);
	if (!post) return undefined;
	const { Content: _, ...meta } = post;
	return meta as PostMeta;
}

export const Route = createFileRoute("/blog_/$slug")({
	staleTime: 1000 * 60 * 5,
	loader: ({ params }) => {
		const meta = getPostMeta(params.slug);
		if (!meta) throw notFound();
		return meta;
	},
	head: ({ loaderData }) => {
		if (!loaderData) return { meta: [{ title: "not found" }] };
		const post = loaderData;
		const ogImage = `${BASE_URL}/api/og?title=${encodeURIComponent(post.title)}`;
		return {
			meta: [
				{ title: `${post.title} | Esaú Morais` },
				{ name: "description", content: post.description },
				{ property: "og:title", content: post.title },
				{ property: "og:description", content: post.description },
				{ property: "og:url", content: `${BASE_URL}/blog/${post.slug}` },
				{ property: "og:type", content: "article" },
				{ property: "og:image", content: ogImage },
				{ property: "og:image:width", content: "1920" },
				{ property: "og:image:height", content: "1080" },
				{ name: "twitter:card", content: "summary_large_image" },
				{ name: "twitter:url", content: `${BASE_URL}/blog/${post.slug}` },
				{ name: "twitter:title", content: post.title },
				{ name: "twitter:description", content: post.description },
				{ name: "twitter:image", content: ogImage },
			],
		};
	},
	component: BlogPostPage,
});

function BlogPostPage() {
	const meta = Route.useLoaderData();
	const post = allPosts.find((p) => p.slug === meta.slug);
	if (!post) throw new Error(`Post not found: ${meta.slug}`);
	const Content = post.Content;

	return (
		<div className="mx-auto max-w-2xl px-6">
			<Link
				to="/blog"
				className="mb-8 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-white"
			>
				<ArrowLeftIcon size={14} className="shrink-0" />
				<span>back</span>
			</Link>

			<header className="mb-12">
				<div className="flex items-center gap-2 text-sm text-gray-500">
					<time dateTime={meta.date}>
						{format(new Date(meta.date), "MMMM d, yyyy")}
					</time>
					<span>·</span>
					<span>{meta.readingTime} min read</span>
				</div>
				<h1 className="mt-2 text-2xl font-bold text-white">{meta.title}</h1>
				<p className="mt-2 text-gray-500">{meta.description}</p>
				<div className="mt-4">
					<NarrationPlayButton slug={meta.slug} />
				</div>
			</header>

			<article className="prose-custom">
				<MDXProvider>
					<Content />
				</MDXProvider>
			</article>
		</div>
	);
}
