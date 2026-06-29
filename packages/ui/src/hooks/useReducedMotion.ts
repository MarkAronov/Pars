import type { Variants } from 'framer-motion';
import { useReducedMotion as useFramerReducedMotion } from 'framer-motion';

export interface UseReducedMotionReturn {
	prefersReducedMotion: boolean;
	resolve: <T extends Variants>(full: T, reduced: T) => T;
}

/**
 * Detects prefers-reduced-motion and provides a resolve() helper
 * to pick between full and simplified animation variants.
 * Reduced = opacity-only (no transforms). Never fully disabled.
 */
export const useReducedMotion = (): UseReducedMotionReturn => {
	const prefersReducedMotion = useFramerReducedMotion() ?? false;
	const resolve = <T extends Variants>(full: T, reduced: T): T =>
		prefersReducedMotion ? reduced : full;
	return { prefersReducedMotion, resolve };
};
