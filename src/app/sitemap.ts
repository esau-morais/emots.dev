import { findAllWorks } from "@/lib/fetch";
import { url } from "@/utils/consts";

const sitemap = async () => {
	const works = await findAllWorks();
	const allWorks = works?.map((work) => ({
		url: `${url}/work/${work.slug}`,
		lastModified: work.editedAt,
	})) as { url: string; lastModified: string }[];

	const routes = ["", "/work", "/checklist"].map((route) => ({
		url: `${url}${route}`,
		lastModified: new Date().toISOString().split("T")[0],
	}));

	return [...routes, ...allWorks];
};

export default sitemap;
