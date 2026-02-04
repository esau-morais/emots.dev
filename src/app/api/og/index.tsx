import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createFileRoute } from "@tanstack/react-router";
import { ImageResponse } from "@vercel/og";
import { BASE_URL } from "@/utils/consts";

export const Route = createFileRoute("/api/og/")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const { searchParams } = new URL(request.url);
				const workTitle = searchParams.get("title");

				const fontData = await readFile(
					join(process.cwd(), "public/JetBrainsMono-Regular.ttf"),
				);

				return new ImageResponse(
					<div
						style={{
							height: "100%",
							width: "100%",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							backgroundImage: `url(${BASE_URL}/black_and_white_light.png)`,
							backgroundRepeat: "no-repeat",
							backgroundSize: "100% 100%",
						}}
					>
						<div
							style={{
								marginLeft: 190,
								marginRight: 190,
								display: "flex",
								fontSize: 130,
								letterSpacing: "-0.05em",
								fontStyle: "normal",
								color: "white",
								lineHeight: "120px",
								whiteSpace: "pre-wrap",
								fontFamily: "JetBrains Mono",
							}}
						>
							{workTitle}
						</div>
					</div>,
					{
						width: 1920,
						height: 1080,
						fonts: [
							{
								name: "JetBrains Mono",
								data: fontData,
								style: "normal",
								weight: 400,
							},
						],
					},
				);
			},
		},
	},
});
