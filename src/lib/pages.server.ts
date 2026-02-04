import matter from "gray-matter";

export type ChecklistItem = {
	id: string;
	label: string;
	category: string;
};

export function parseChecklistFromMdx(content: string): {
	items: ChecklistItem[];
	categories: string[];
} {
	const { content: body } = matter(content);
	const lines = body.split("\n");
	const items: ChecklistItem[] = [];
	const categories: string[] = [];
	let currentCategory = "";
	let itemIndex = 0;

	for (const line of lines) {
		const headingMatch = line.match(/^##\s+(.+)$/);
		if (headingMatch) {
			currentCategory = headingMatch[1].trim();
			if (!categories.includes(currentCategory)) {
				categories.push(currentCategory);
			}
			continue;
		}

		const taskMatch = line.match(/^-\s+\[([ xX])\]\s+(.+)$/);
		if (taskMatch && currentCategory) {
			items.push({
				id: `item-${itemIndex++}`,
				label: taskMatch[2].trim(),
				category: currentCategory,
			});
		}
	}

	return { items, categories };
}

export type KeyValueItem = {
	label: string;
	value: string;
};

export type KeyValueSection = {
	heading: string;
	items: KeyValueItem[];
};

export function parseKeyValueSections(content: string): KeyValueSection[] {
	const { content: body } = matter(content);
	const lines = body.split("\n");
	const sections: KeyValueSection[] = [];
	let currentSection: KeyValueSection | null = null;

	for (const line of lines) {
		const headingMatch = line.match(/^##\s+(.+)$/);
		if (headingMatch) {
			if (currentSection) sections.push(currentSection);
			currentSection = { heading: headingMatch[1].trim(), items: [] };
			continue;
		}

		const kvMatch = line.match(/^-\s+(.+?):\s+(.+)$/);
		if (kvMatch && currentSection) {
			currentSection.items.push({
				label: kvMatch[1].trim(),
				value: kvMatch[2].trim(),
			});
		}
	}

	if (currentSection) sections.push(currentSection);
	return sections;
}
