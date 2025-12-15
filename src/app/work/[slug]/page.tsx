import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { LazyVideo } from "@/components/lazy-video";
import { findAllWorks, findSingleWorkBySlug } from "@/lib/fetch";
import { cn } from "@/utils/classNames";
import { BASE_URL, url } from "@/utils/consts";
import { getFiletypeFromString } from "@/utils/filetype";
import { shimmer, toBase64 } from "@/utils/shimmer";

type Params = {
	params: Promise<{ slug: string }>;
};

export const generateStaticParams = async () => {
	const works = await findAllWorks();
	return works?.map((work) => ({ slug: work.slug })) ?? [];
};

export const generateMetadata = async (props: Params): Promise<Metadata> => {
	const params = await props.params;
	const work = await findSingleWorkBySlug(params.slug);
	if (!work) notFound();
	const image = `${BASE_URL}/api/og?title=${work?.metadata.title}`;

	return {
		title: work?.metadata.title,
		openGraph: { url: `${url}/work/${params.slug}`, images: [image] },
		twitter: { images: [image] },
	};
};

const SingleWorkPage = async (props: Params) => {
	const params = await props.params;
	const { slug } = params;
	const work = await findSingleWorkBySlug(slug);

	return (
		<div className="mx-auto max-w-4xl px-6 pb-20 pt-16">
			<div className="inline-flex items-start space-x-2">
				<Link className="mb-2 underline underline-offset-2" href="/work">
					Work
				</Link>
				<span>/</span>
				<h1 className="font-bold">{work?.metadata.title}</h1>
			</div>

			<ReactMarkdown
				components={{
					h2: ({ children }) => (
						<h2 className="mb-2 mt-8 text-xl font-bold">{children}</h2>
					),
					blockquote: ({ children }) => (
						<blockquote className="my-4 border-l-4 border-ctp-rosewater bg-base p-4 font-medium italic leading-relaxed text-white">
							{children}
						</blockquote>
					),
					ul: ({ children }) => (
						<ul className="ml-4 list-['▲'] flex-wrap space-y-1">{children}</ul>
					),
					li: ({ children }) => (
						<li className="pl-4 marker:text-xs">{children}</li>
					),
					strong: ({ children }) => (
						<strong className="font-semibold">{children}</strong>
					),
					a: ({ children, node, ...props }) => {
						const video = node as any;
						if (getFiletypeFromString(video.properties.href) === "mp4") {
							return <LazyVideo src={video.properties.href} />;
						}

						return (
							<a
								className="underline decoration-blue decoration-wavy underline-offset-4"
								target="_blank"
								rel="noopener noreferrer"
								{...props}
							>
								{children}
							</a>
						);
					},
					p: ({ children, node }) => {
						if ((node?.children[0] as unknown as Element).tagName === "img") {
							const image = node?.children[0] as any;

							return (
								<div className="relative mt-4 aspect-video w-full overflow-hidden rounded-2xl">
									<Image
										src={image.properties.src}
										className={cn(
											"object-cover",
											"transition-all duration-500 hover:scale-105 active:scale-100",
										)}
										alt={work?.metadata.title ?? "Work"}
										loading="lazy"
										fill
										placeholder="blur"
										blurDataURL={`data:image/svg+xml;base64,${toBase64(
											shimmer(128, 96),
										)}`}
									/>
								</div>
							);
						}
						return <p className="my-1">{children}</p>;
					},
				}}
				remarkPlugins={[remarkGfm]}
			>
				{work?.markdown ?? ""}
			</ReactMarkdown>
		</div>
	);
};

export default SingleWorkPage;
