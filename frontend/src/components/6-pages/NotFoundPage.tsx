import { Link } from '@tanstack/react-router';
import { cn } from '../../lib/utils';
import { COLORS, TYPOGRAPHY } from '../1-ions';

const NotFoundPage = () => (
	<div
		className={cn(
			'min-h-screen flex flex-col items-center justify-center px-4 gap-4 text-center',
			COLORS.bg,
		)}
	>
		<p
			className={cn(
				'font-bold text-neutral-800 select-none',
				'text-[8rem] leading-none',
			)}
		>
			404
		</p>
		<h1
			className={cn(
				TYPOGRAPHY.TEXT['2xl'],
				TYPOGRAPHY.WEIGHT.semibold,
				'text-white',
			)}
		>
			Page not found
		</h1>
		<p className={cn(TYPOGRAPHY.TEXT.sm, COLORS.textMuted, 'max-w-xs')}>
			The page you're looking for doesn't exist or has been moved.
		</p>
		<Link
			to="/"
			className="mt-2 px-5 py-2.5 rounded-md bg-white text-neutral-950 text-sm font-medium hover:bg-neutral-200 transition-colors"
		>
			Go home
		</Link>
	</div>
);

export default NotFoundPage;
