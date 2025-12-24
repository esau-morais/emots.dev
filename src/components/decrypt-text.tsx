"use client";

import { useEffect, useState } from "react";

interface DecryptTextProps {
	text: string;
	className?: string;
	speed?: number;
	autoStart?: boolean;
	triggerOnHover?: boolean;
}

const CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

export function DecryptText({
	text,
	className = "",
	speed = 30,
	autoStart = true,
	triggerOnHover = false,
}: DecryptTextProps) {
	const [displayText, setDisplayText] = useState(text);
	const [isDecrypting, setIsDecrypting] = useState(false);

	const decrypt = () => {
		if (isDecrypting) return;
		setIsDecrypting(true);

		let iteration = 0;
		const interval = setInterval(() => {
			setDisplayText(
				text
					.split("")
					.map((_char, index) => {
						if (index < iteration) {
							return text[index];
						}
						return CHARS[Math.floor(Math.random() * CHARS.length)];
					})
					.join(""),
			);

			if (iteration >= text.length) {
				clearInterval(interval);
				setIsDecrypting(false);
			}

			iteration += 1 / 3;
		}, speed);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies(decrypt): leave to compiler
	useEffect(() => {
		if (autoStart && !triggerOnHover) {
			decrypt();
		}
	}, [autoStart, triggerOnHover]);

	const handlers = triggerOnHover
		? {
				onMouseEnter: decrypt,
			}
		: {};

	return (
		<span className={className} {...handlers}>
			{displayText}
		</span>
	);
}
