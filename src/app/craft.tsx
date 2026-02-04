import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { allPages } from "content-collections";
import { parseKeyValueSections } from "@/lib/pages.server";

const getCraftPageData = createServerFn({ method: "GET" }).handler(() => {
	const page = allPages.find((p) => p.slug === "craft");
	if (!page) throw new Error("Craft page not found");
	const sections = parseKeyValueSections(page.content);
	return { page, sections };
});

export const Route = createFileRoute("/craft")({
	loader: () => getCraftPageData(),
	head: ({ loaderData }) => ({
		meta: [
			{ title: `${loaderData?.page.title} | Esaú Morais` },
			{ name: "description", content: loaderData?.page.description },
		],
	}),
	component: CraftPage,
});

function CraftPage() {
	const { page, sections } = Route.useLoaderData();

	return (
		<div className="mx-auto max-w-2xl px-6">
			<h1 className="mb-12 text-lg font-medium text-white">{page.title}</h1>

			{sections.map((section) => (
				<section key={section.heading} className="mb-12">
					<h2 className="text-xs mb-6 font-medium uppercase tracking-[0.2em] text-gray-600">
						{section.heading}
					</h2>
					<ul className="space-y-3">
						{section.items.map((item) => (
							<li
								key={item.label}
								className="flex items-baseline justify-between border-b border-gray-900 pb-3"
							>
								<span className="text-sm text-gray-600">{item.label}</span>
								<span className="text-gray-400">{item.value}</span>
							</li>
						))}
					</ul>
				</section>
			))}
		</div>
	);
}
