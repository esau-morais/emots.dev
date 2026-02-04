import { MDXProvider as BaseMDXProvider } from "@mdx-js/react";
import type { ReactNode } from "react";
import { mdxComponents } from "@/components/mdx-components";

export function MDXProvider({ children }: { children: ReactNode }) {
	return (
		<BaseMDXProvider components={mdxComponents}>{children}</BaseMDXProvider>
	);
}
