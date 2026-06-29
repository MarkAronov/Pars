export const RADIUS = {
	sm: 'rounded',
	md: 'rounded-md',
	lg: 'rounded-lg',
	xl: 'rounded-xl',
	full: 'rounded-full',
} as const;

export const BORDER = {
	base: 'border border-neutral-800',
	subtle: 'border border-neutral-700',
	active: 'border border-neutral-500',
	focus:
		'focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500',
} as const;

export const BORDERS = { RADIUS, BORDER } as const;
