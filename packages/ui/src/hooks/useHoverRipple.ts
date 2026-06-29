import type React from 'react';
import { useCallback, useState } from 'react';

export type HoverRippleState = {
	/** Horizontal entry position as % of element width (0–100) */
	rippleX: number;
	/** Vertical entry position as % of element height (0–100) */
	rippleY: number;
	/** True while the mouse is over the element — drives AnimatePresence */
	isHovering: boolean;
	/** Attach to the element's onMouseEnter prop */
	onMouseEnter: (e: React.MouseEvent<HTMLElement>) => void;
	/** Attach to the element's onMouseLeave prop */
	onMouseLeave: () => void;
};

/**
 * Tracks mouse entry coordinates for clipPath ripple overlays.
 * rippleX/Y are element-relative percentages (0–100) of where the mouse entered.
 */
export const useHoverRipple = (): HoverRippleState => {
	const [isHovering, setIsHovering] = useState(false);
	const [rippleX, setRippleX] = useState(50);
	const [rippleY, setRippleY] = useState(50);

	const onMouseEnter = useCallback((e: React.MouseEvent<HTMLElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
		const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
		setRippleX(Math.round(x));
		setRippleY(Math.round(y));
		setIsHovering(true);
	}, []);

	const onMouseLeave = useCallback(() => {
		setIsHovering(false);
	}, []);

	return { rippleX, rippleY, isHovering, onMouseEnter, onMouseLeave };
};
