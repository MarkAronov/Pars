export const FONT = {
	family: 'font-sans',
	mono: 'font-mono',
} as const;

export const TEXT = {
	xs: 'text-xs',
	sm: 'text-sm',
	base: 'text-base',
	lg: 'text-lg',
	xl: 'text-xl',
	'2xl': 'text-2xl',
	'3xl': 'text-3xl',
} as const;

export const WEIGHT = {
	normal: 'font-normal',
	medium: 'font-medium',
	semibold: 'font-semibold',
	bold: 'font-bold',
} as const;

export const LEADING = {
	tight: 'leading-tight',
	snug: 'leading-snug',
	normal: 'leading-normal',
} as const;

export const TYPOGRAPHY = { FONT, TEXT, WEIGHT, LEADING } as const;
