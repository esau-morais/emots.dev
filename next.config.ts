import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactCompiler: true,
	cacheComponents: true,
	typedRoutes: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "github.com",
			},
			{
				protocol: "https",
				hostname: "**.s3.us-west-2.amazonaws.com",
			},
		],
	},
	redirects: async () => {
		return [
			{
				source: "/links",
				destination: "https://links.emots.dev",
				permanent: true,
			},
			{
				source: "/meet",
				destination: "https://cal.com/emorais/appointment",
				permanent: true,
			},
		];
	},
};

export default nextConfig;
