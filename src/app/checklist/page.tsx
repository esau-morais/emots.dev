import { InteractiveChecklist } from "@/components/interactive-checklist";

export const metadata = {
	title: "Web Guidelines Checklist",
};

const ChecklistPage = () => {
	return (
		<article className="mx-auto max-w-3xl px-6 py-20">
			<header className="mb-12">
				<h1 className="mb-4 font-mono text-4xl font-bold text-ctp-text">
					Web Guidelines Checklist
				</h1>
				<p className="mb-6 text-ctp-subtext0">
					Essential performance & accessibility guidelines for modern web
					development.
				</p>

				<InteractiveChecklist />
			</header>

			<footer className="mt-16 border-t border-ctp-surface0 pt-8">
				<h3 className="mb-4 font-mono text-sm font-semibold uppercase tracking-wider text-ctp-subtext1">
					Credits
				</h3>
				<div className="space-y-2 text-sm text-ctp-subtext0">
					<p>
						Guidelines adapted from{" "}
						<a
							href="https://vercel.com/design/guidelines"
							target="_blank"
							rel="noopener noreferrer"
							className="text-rosewater underline hover:text-ctp-pink"
						>
							Vercel Web Interface Guidelines
						</a>{" "}
						and{" "}
						<a
							href="https://roadmap.sh/frontend-performance-best-practices"
							target="_blank"
							rel="noopener noreferrer"
							className="text-ctp-rosewater underline hover:text-ctp-pink"
						>
							Frontend Performance Best Practices (roadmap.sh)
						</a>
						.
					</p>
					<p className="text-xs text-ctp-overlay0">
						Checklist state stored in browser memory only.
					</p>
				</div>
			</footer>
		</article>
	);
};

export default ChecklistPage;
