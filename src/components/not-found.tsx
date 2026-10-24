import { IsometricGrid } from "./isometric-grid";

export function NotFoundPage() {
	return (
		<div className="fixed inset-x-0 top-(--header-h) bottom-(--footer-h) overflow-hidden">
			<IsometricGrid />
		</div>
	);
}
