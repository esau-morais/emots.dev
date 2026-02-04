export const getFiletypeFromString = (path: string) =>
	path.split(/[#?]/)[0].split(".").pop()?.trim();
