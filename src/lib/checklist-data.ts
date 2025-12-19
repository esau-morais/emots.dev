export type ChecklistItem = {
	id: string;
	label: string;
	category: string;
};

export const CHECKLIST_ITEMS: ChecklistItem[] = [
	// Performance - Critical
	{ id: "p1", label: "Keep page weight < 500KB", category: "Performance" },
	{ id: "p2", label: "Keep page load time < 3s", category: "Performance" },
	{ id: "p3", label: "Time To First Byte < 1.3s", category: "Performance" },
	{
		id: "p4",
		label: "Enable Brotli/GZIP compression",
		category: "Performance",
	},
	{
		id: "p5",
		label: "Minify JavaScript & CSS files",
		category: "Performance",
	},
	{ id: "p6", label: "Inline critical CSS", category: "Performance" },
	{
		id: "p7",
		label: "Use async/defer for non-critical JS",
		category: "Performance",
	},
	{
		id: "p8",
		label: "Deploy with CDN & HTTPS",
		category: "Performance",
	},

	// Images
	{
		id: "i1",
		label: "Set width/height for images (prevent CLS)",
		category: "Images",
	},
	{ id: "i2", label: "Lazy load offscreen images", category: "Images" },
	{
		id: "i3",
		label: "Use WebP/AVIF formats",
		category: "Images",
	},
	{
		id: "i4",
		label: "Serve images matching display size",
		category: "Images",
	},

	// Fonts
	{ id: "f1", label: "Use WOFF2 font format", category: "Fonts" },
	{ id: "f2", label: "Keep web font size < 300KB", category: "Fonts" },
	{ id: "f3", label: "Subset fonts to used characters", category: "Fonts" },
	{
		id: "f4",
		label: "Prevent Flash of Unstyled Text",
		category: "Fonts",
	},

	// Accessibility
	{
		id: "a1",
		label: "All flows keyboard-operable (WAI-ARIA)",
		category: "Accessibility",
	},
	{
		id: "a2",
		label: "Use :focus-visible for keyboard users",
		category: "Accessibility",
	},
	{
		id: "a3",
		label: "Touch targets ≥24px desktop / ≥44px mobile",
		category: "Accessibility",
	},
	{
		id: "a4",
		label: "Input font-size ≥16px on mobile (prevent zoom)",
		category: "Accessibility",
	},
	{
		id: "a5",
		label: "Respect prefers-reduced-motion",
		category: "Accessibility",
	},

	// Forms & Interactions
	{
		id: "fi1",
		label: "Enable Enter to submit single-input forms",
		category: "Forms",
	},
	{
		id: "fi2",
		label: "Keep submit enabled, validate on attempt",
		category: "Forms",
	},
	{
		id: "fi3",
		label: "Allow any input, validate & show feedback",
		category: "Forms",
	},
	{
		id: "fi4",
		label: "Target <500ms for POST/PATCH/DELETE",
		category: "Forms",
	},

	// Animations & Layout
	{
		id: "al1",
		label: "Use GPU-accelerated properties (transform, opacity)",
		category: "Animations",
	},
	{
		id: "al2",
		label: "Avoid transition: all",
		category: "Animations",
	},
	{
		id: "al3",
		label: "Only animate when clarifying cause-effect",
		category: "Animations",
	},
	{
		id: "al4",
		label: "Use flexbox/grid over JS measurements",
		category: "Layout",
	},

	// Content
	{
		id: "c1",
		label: "Use active voice in copy",
		category: "Content",
	},
	{
		id: "c2",
		label: "Frame errors positively with solutions",
		category: "Content",
	},
	{
		id: "c3",
		label: "Use proper typography (curly quotes, ellipsis)",
		category: "Content",
	},
];

export const CATEGORIES = [
	"Performance",
	"Images",
	"Fonts",
	"Accessibility",
	"Forms",
	"Animations",
	"Layout",
	"Content",
] as const;
