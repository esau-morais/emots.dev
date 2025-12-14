import { Client, isFullPage } from "@notionhq/client";
import { cacheLife, cacheTag } from "next/cache";
import { NotionToMarkdown } from "notion-to-md";
import { cache } from "react";
import { getPageMetadata } from "@/utils/metadata";

import { env } from "./env";
import type { Work, WorkMetadata } from "./types/work";

const { NOTION_KEY, DATABASE_ID } = env;

const notion = new Client({ auth: NOTION_KEY });

const getDataSourceId = cache(async () => {
	const db = await notion.databases.retrieve({ database_id: DATABASE_ID });
	if ("data_sources" in db) {
		return db.data_sources[0].id;
	}
	throw new Error("Database not accessible");
});

export const findAllWorks = async () => {
	"use cache";
	cacheTag("works");
	cacheLife("hours");

	try {
		const dataSourceId = await getDataSourceId();
		const response = await notion.dataSources.query({
			data_source_id: dataSourceId,
			filter: {
				property: "Status",
				select: {
					equals: "Published",
				},
			},
			sorts: [
				{
					property: "ReleaseDate",
					direction: "descending",
				},
			],
		});

		const allWorks = response.results.filter(isFullPage);
		return allWorks.map((singleWork) =>
			getPageMetadata(singleWork),
		) as WorkMetadata[];
	} catch (error) {
		if (error instanceof Error) console.error(error);
	}
};

const notionToMarkdown = new NotionToMarkdown({ notionClient: notion });

export const findSingleWorkBySlug = async (slug: string) => {
	"use cache";
	cacheTag("work", `work-${slug}`);
	cacheLife("hours");

	try {
		const dataSourceId = await getDataSourceId();
		const response = await notion.dataSources.query({
			data_source_id: dataSourceId,
			filter: {
				property: "Slug",
				formula: {
					string: {
						equals: slug,
					},
				},
			},
		});

		const page = response.results.filter(isFullPage)[0];
		if (!page) return;
		const metadata = getPageMetadata(page);
		const mdblocks = await notionToMarkdown.pageToMarkdown(page.id);
		const mdString = notionToMarkdown.toMarkdownString(mdblocks).parent;

		return {
			metadata,
			markdown: mdString,
		} as Work;
	} catch (error) {
		if (error instanceof Error) console.error(error);
	}
};
