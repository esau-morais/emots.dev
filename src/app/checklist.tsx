import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { allPages } from "content-collections";
import { InteractiveChecklist } from "@/components/interactive-checklist";
import { parseChecklistFromMdx } from "@/lib/pages.server";

const getChecklistPageData = createServerFn({ method: "GET" }).handler(() => {
	const page = allPages.find((p) => p.slug === "checklist");
	if (!page) throw new Error("Checklist page not found");
	const { items, categories } = parseChecklistFromMdx(page.content);
	return { page, items, categories };
});

export const Route = createFileRoute("/checklist")({
	loader: () => getChecklistPageData(),
	head: ({ loaderData }) => ({
		meta: [
			{ title: `${loaderData?.page.title} | Esaú Morais` },
			{ name: "description", content: loaderData?.page.description },
		],
	}),
	component: ChecklistPage,
});

function ChecklistPage() {
	const { page, items, categories } = Route.useLoaderData();

	return (
		<article className="mx-auto max-w-2xl px-6">
			<header className="mb-12">
				<h1 className="mb-4 font-mono text-4xl font-bold text-white">
					{page.title}
				</h1>
				<p className="mb-6 text-gray-400">{page.description}</p>

				<InteractiveChecklist items={items} categories={categories} />
			</header>

			<footer className="mt-16 border-t border-gray-800 pt-8">
				<h3 className="mb-4 font-mono text-sm font-semibold uppercase tracking-wider text-gray-400">
					Credits
				</h3>
				<div className="space-y-2 text-sm text-gray-400">
					<p>
						Guidelines adapted from{" "}
						<a
							href="https://vercel.com/design/guidelines"
							target="_blank"
							rel="noopener noreferrer"
							className="text-white underline hover:text-gray-200"
						>
							Vercel Web Interface Guidelines
						</a>{" "}
						and{" "}
						<a
							href="https://roadmap.sh/frontend-performance-best-practices"
							target="_blank"
							rel="noopener noreferrer"
							className="text-white underline hover:text-gray-200"
						>
							Frontend Performance Best Practices (roadmap.sh)
						</a>
						.
					</p>
					<p className="text-xs text-gray-500">
						Checklist state stored in browser memory only.
					</p>
				</div>
			</footer>
		</article>
	);
}
