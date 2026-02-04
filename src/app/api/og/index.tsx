import { initWasm, Resvg } from "@resvg/resvg-wasm";
import { createFileRoute } from "@tanstack/react-router";
import satori from "satori";
import { BASE_URL } from "@/utils/consts";

let wasmInitialized = false;

export const Route = createFileRoute("/api/og/")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const { searchParams } = new URL(request.url);
				const workTitle = searchParams.get("title") || "emots.dev";

				const fontResponse = await fetch(
					`${BASE_URL}/JetBrainsMono-Regular.ttf`,
				);
				const fontData = await fontResponse.arrayBuffer();

				if (!wasmInitialized) {
					await initWasm(
						fetch("https://unpkg.com/@resvg/resvg-wasm@2.6.2/index_bg.wasm"),
					);
					wasmInitialized = true;
				}

				const svg = await satori(
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

				const resvg = new Resvg(svg, {
					fitTo: { mode: "width", value: 1920 },
				});
				const pngData = resvg.render().asPng();
				const pngBuffer = Buffer.from(pngData);

				return new Response(pngBuffer, {
					headers: {
						"Content-Type": "image/png",
						"Cache-Control": "public, max-age=31536000, immutable",
					},
				});
			},
		},
	},
});
