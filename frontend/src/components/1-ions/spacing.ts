export const GAP = {
	xs: 'gap-1',
	sm: 'gap-2',
	md: 'gap-3',
	lg: 'gap-4',
	xl: 'gap-6',
	'2xl': 'gap-8',
} as const;

export const PADDING = {
	card: 'p-4',
	cardX: 'px-4',
	cardY: 'py-4',
	section: 'py-6 px-4',
	page: 'py-6',
	button: 'px-4 py-1.5',
	buttonSm: 'px-3 py-1',
} as const;

export const STACK = {
	sm: 'flex flex-col gap-2',
	md: 'flex flex-col gap-3',
	lg: 'flex flex-col gap-4',
	xl: 'flex flex-col gap-6',
} as const;

export const SPACING = { GAP, PADDING, STACK } as const;
