import { createFileRoute } from "@tanstack/react-router";
import { allWorks } from "content-collections";
import { WorkList } from "@/components/work-list";

function getWorks() {
	return allWorks
		.filter((w) => !w.draft)
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.map(({ Content: _, content: __, ...work }) => work);
}

export const Route = createFileRoute("/work")({
	staleTime: 1000 * 60 * 5,
	loader: () => getWorks(),
	head: () => ({
		meta: [{ title: "Works | Esaú Morais" }],
	}),
	component: WorksPage,
});

function WorksPage() {
	const works = Route.useLoaderData();

	return (
		<div className="mx-auto max-w-2xl px-6">
			<h1 className="mb-12 text-lg font-medium text-white">work</h1>

			{works.length === 0 ? (
				<p className="text-gray-500">no works yet.</p>
			) : (
				<WorkList works={works} />
			)}
		</div>
	);
}
