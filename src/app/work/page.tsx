import type { Metadata } from "next";
import Link from "next/link";

import { findAllWorks } from "@/lib/fetch";

export const metadata: Metadata = {
	title: "Works",
};

const Works = async () => {
	const works = await findAllWorks();

	return (
		<table className="mx-auto w-full max-w-2xl text-sm">
			<thead>
				<tr className="transition-colors hover:bg-ctp-crust focus:bg-ctp-crust focus:outline-none">
					<th className="text-ctp-muted-foreground h-12 px-4 text-left align-middle font-medium" />
					<th className="text-ctp-muted-foreground h-12 px-4 text-left align-middle font-medium">
						Project
					</th>
					<th className="text-ctp-muted-foreground h-12 px-4 text-right align-middle font-medium">
						Year
					</th>
				</tr>
			</thead>
			<tbody className="[counter-reset:project]">
				{works?.map((work) => (
					<tr
						key={work.id}
						className="w-full border-l-2 border-transparent transition-colors focus-within:border-ctp-rosewater focus-within:bg-ctp-crust hover:bg-ctp-crust"
					>
						<td className="w-4 p-4 align-middle font-medium text-ctp-overlay0 before:[content:counter(project)]! before:[counter-increment:project]!" />
						<td className="p-4 align-middle font-medium">
							<Link
								className="underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ctp-rosewater focus-visible:ring-offset-2 focus-visible:ring-offset-[#1e1e2e]"
								href={`/work/${work.slug}`}
							>
								{work.title}
							</Link>
						</td>
						<td className="p-4 text-right align-middle font-medium">
							{new Date(work.releasedAt).getFullYear()}
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
};

export default Works;
