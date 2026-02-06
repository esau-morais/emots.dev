"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
} from "react";

type PauseCallback = () => void;

interface MediaCoordinatorValue {
	register: (id: string, pause: PauseCallback) => void;
	unregister: (id: string) => void;
	requestPlay: (id: string) => void;
}

const MediaCoordinatorContext = createContext<MediaCoordinatorValue | null>(
	null,
);

export function MediaCoordinatorProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const sourcesRef = useRef(new Map<string, PauseCallback>());

	const register = useCallback((id: string, pause: PauseCallback) => {
		sourcesRef.current.set(id, pause);
	}, []);

	const unregister = useCallback((id: string) => {
		sourcesRef.current.delete(id);
	}, []);

	const requestPlay = useCallback((id: string) => {
		for (const [sourceId, pause] of sourcesRef.current) {
			if (sourceId !== id) pause();
		}
	}, []);

	return (
		<MediaCoordinatorContext.Provider
			value={{ register, unregister, requestPlay }}
		>
			{children}
		</MediaCoordinatorContext.Provider>
	);
}

export function useMediaCoordinator(): MediaCoordinatorValue {
	const ctx = useContext(MediaCoordinatorContext);
	if (!ctx) {
		throw new Error(
			"useMediaCoordinator must be used within MediaCoordinatorProvider",
		);
	}
	return ctx;
}

export function useMediaSource(id: string, pause: PauseCallback) {
	const { register, unregister, requestPlay } = useMediaCoordinator();
	const pauseRef = useRef(pause);
	pauseRef.current = pause;

	useEffect(() => {
		register(id, () => pauseRef.current());
		return () => unregister(id);
	}, [id, register, unregister]);

	const play = useCallback(() => {
		requestPlay(id);
	}, [id, requestPlay]);

	return { requestPlay: play };
}
