import { Link } from '@tanstack/react-router';
import { cn } from '../../lib/utils';
import { BORDERS, COLORS, TYPOGRAPHY } from '../1-ions';
import AuthLayout from '../5-templates/AuthLayout';

const StartPage = () => (
	<AuthLayout>
		<div className="w-full max-w-xs flex flex-col items-center gap-8">
			<div className="text-center">
				<h1 className={cn('text-5xl font-bold tracking-tight text-white mb-3')}>
					Pars
				</h1>
				<p className={cn(TYPOGRAPHY.TEXT.base, COLORS.textMuted)}>
					A place to share ideas and connect.
				</p>
			</div>

			<div className="flex flex-col gap-3 w-full">
				<Link
					to="/signup"
					className="text-center bg-white text-neutral-950 px-5 py-2.5 text-sm font-medium hover:bg-neutral-200 transition-colors rounded-md"
				>
					Get started
				</Link>
				<Link
					to="/login"
					className={cn(
						'text-center px-5 py-2.5 text-sm font-medium transition-colors',
						BORDERS.RADIUS.md,
						BORDERS.BORDER.base,
						COLORS.textSecondary,
						'hover:text-white hover:border-neutral-500',
					)}
				>
					Sign in
				</Link>
			</div>

			<Link
				to="/about"
				className={cn(
					TYPOGRAPHY.TEXT.xs,
					COLORS.textDisabled,
					'hover:text-neutral-400 transition-colors',
				)}
			>
				About Pars
			</Link>
		</div>
	</AuthLayout>
);

export default StartPage;
