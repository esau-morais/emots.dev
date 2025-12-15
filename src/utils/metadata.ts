import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

type PageProperties = {
	Cover: {
		type: "files";
		files: Array<{
			type: "file";
			file: { url: string };
		}>;
	};
	Title: {
		type: "title";
		title: Array<{ plain_text: string }>;
	};
	Slug: {
		type: "rich_text";
		rich_text: Array<{ plain_text: string }>;
	};
	Type: {
		type: "select";
		select: { name: string };
	};
	ReleaseDate: {
		type: "date";
		date: { start: string };
	};
};

type WorkPage = Omit<PageObjectResponse, "properties"> & {
	properties: PageProperties;
};

export const getPageMetadata = (page: PageObjectResponse) => {
	const p = page as unknown as WorkPage;
	return {
		id: p.id,
		cover: p.properties.Cover.files[0]?.file.url,
		title: p.properties.Title.title[0].plain_text,
		slug: p.properties.Slug.rich_text[0].plain_text,
		type: p.properties.Type.select.name,
		releasedAt: p.properties.ReleaseDate.date.start,
		editedAt: p.last_edited_time,
	};
};
