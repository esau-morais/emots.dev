export const shimmer = (
	w: number,
	h: number,
	theme: "dark" | "light" = "dark",
) => {
	const base = theme === "light" ? "#d5d5d0" : "#333";
	const highlight = theme === "light" ? "#e8e8e4" : "#222";
	return `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="${base}" offset="20%" />
      <stop stop-color="${highlight}" offset="50%" />
      <stop stop-color="${base}" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="${base}" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;
};

export const toBase64 = (str: string) =>
	typeof window === "undefined"
		? Buffer.from(str).toString("base64")
		: window.btoa(str);
