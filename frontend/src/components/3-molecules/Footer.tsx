import { Link } from '@tanstack/react-router';
import { cn } from '../../lib/utils';
import { COLORS, TYPOGRAPHY } from '../1-ions';

const Footer = () => (
	<footer className={cn('border-t border-neutral-800 mt-auto py-8 px-4')}>
		<div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
			<div className="flex flex-col items-center sm:items-start gap-1">
				<span className={cn('font-bold', TYPOGRAPHY.TEXT.sm, 'text-white')}>
					Pars
				</span>
				<span className={cn(TYPOGRAPHY.TEXT.xs, COLORS.textMuted)}>
					A place to share ideas and connect.
				</span>
			</div>

			<nav
				className={cn(
					'flex items-center gap-4',
					TYPOGRAPHY.TEXT.xs,
					COLORS.textMuted,
				)}
			>
				<Link to="/about" className="hover:text-neutral-300 transition-colors">
					About
				</Link>
				<a
					href="https://github.com/MarkAronov/Pars"
					target="_blank"
					rel="noopener noreferrer"
					className="hover:text-neutral-300 transition-colors"
				>
					GitHub
				</a>
			</nav>
		</div>

		<p
			className={cn(
				'text-center mt-6',
				TYPOGRAPHY.TEXT.xs,
				COLORS.textDisabled,
			)}
		>
			© {new Date().getFullYear()} Pars. All rights reserved.
		</p>
	</footer>
);

export default Footer;
