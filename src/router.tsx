import { QueryClient } from "@tanstack/react-query";
import { experimental_createQueryPersister } from "@tanstack/react-query-persist-client";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { NotFoundPage } from "./components/not-found";
import { routeTree } from "./routeTree.gen";

const CACHE_TIME = 1000 * 60 * 60 * 24; // 24 hours

const persister =
	typeof window !== "undefined"
		? experimental_createQueryPersister({
				storage: window.localStorage,
				maxAge: CACHE_TIME,
				prefix: "emots-query",
			})
		: null;

if (typeof window !== "undefined") {
	window.history.scrollRestoration = "manual";
}

export function getRouter() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 1000 * 60 * 5,
				gcTime: CACHE_TIME,
				...(persister && { persister: persister.persisterFn }),
			},
		},
	});

	const router = createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		scrollRestorationBehavior: "auto",
		defaultPreload: "intent",
		defaultNotFoundComponent: NotFoundPage,
	});

	setupRouterSsrQueryIntegration({
		router,
		queryClient,
	});

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
