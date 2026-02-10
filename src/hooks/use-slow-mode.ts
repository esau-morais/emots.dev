import { useCallback, useMemo, useRef } from "react";
import { useDemoContext } from "@/components/mdx/demo";

const NORMAL_SPEED = 1;
const SLOW_SPEED = 0.24;

export const useSlowMode = () => {
	const { slowMode } = useDemoContext();

	const slowModeRef = useRef(slowMode);
	slowModeRef.current = slowMode;

	const getSpeed = useCallback(
		() => (slowModeRef.current ? SLOW_SPEED : NORMAL_SPEED),
		[],
	);

	const scaleTime = useCallback(
		(baseMs: number) => baseMs / getSpeed(),
		[getSpeed],
	);

	const springConfig = useMemo(
		() => ({
			type: "spring" as const,
			stiffness: slowMode ? 180 : 500,
			damping: slowMode ? 16 : 35,
		}),
		[slowMode],
	);

	return {
		slowMode,
		slowModeRef,
		getSpeed,
		scaleTime,
		springConfig,
		duration: slowMode ? 0.8 : 0.2,
		stagger: slowMode ? 0.3 : 0.08,
	};
};
