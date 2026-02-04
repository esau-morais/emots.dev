import { createFileRoute } from "@tanstack/react-router";
import { getNarrationData } from "@/lib/narration";

export const Route = createFileRoute("/api/narration/$slug")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				const data = await getNarrationData(params.slug);

				if (!data) {
					return Response.json(
						{ error: "Narration not found" },
						{ status: 404 },
					);
				}

				return Response.json(data);
			},
		},
	},
});
