export const ICON = {
	xs: 'w-3 h-3',
	sm: 'w-4 h-4',
	md: 'w-5 h-5',
	lg: 'w-6 h-6',
	xl: 'w-8 h-8',
} as const;

export const AVATAR = {
	sm: 'w-8 h-8 text-xs',
	md: 'w-10 h-10 text-sm',
	lg: 'w-16 h-16 text-xl',
	xl: 'w-20 h-20 text-2xl',
} as const;

export const SIZING = { ICON, AVATAR } as const;
