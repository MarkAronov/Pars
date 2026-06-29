export const COLORS = {
	// Backgrounds
	bg: 'bg-neutral-950',
	surface: 'bg-neutral-900',
	surfaceRaised: 'bg-neutral-800',

	// Borders
	border: 'border-neutral-800',
	borderSubtle: 'border-neutral-700',
	borderActive: 'border-neutral-500',

	// Text
	textPrimary: 'text-neutral-100',
	textSecondary: 'text-neutral-300',
	textMuted: 'text-neutral-500',
	textDisabled: 'text-neutral-600',

	// Accent — violet, distinct from SkillVector's primary
	accent: 'text-violet-400',
	accentBg: 'bg-violet-500',
	accentHover: 'hover:bg-violet-600',
	accentBorder: 'border-violet-500',

	// Semantic
	danger: 'text-red-400',
	dangerHover: 'hover:text-red-300',
	success: 'text-green-400',
	verified: 'text-blue-400',
} as const;

export const HOVER = {
	surface: 'hover:bg-neutral-800',
	border: 'hover:border-neutral-500',
	text: 'hover:text-white',
} as const;
