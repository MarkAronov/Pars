import { Link } from '@tanstack/react-router';
import { Compass, MessageSquare, Pencil, Users } from 'lucide-react';
import { cn } from '../../lib/utils';
import { COLORS, TYPOGRAPHY } from '../1-ions';
import Footer from '../3-molecules/Footer';

const features = [
	{ icon: Compass, label: 'Follow your interests' },
	{ icon: Users, label: 'Connect with people' },
	{ icon: MessageSquare, label: 'Join the conversation' },
	{ icon: Pencil, label: 'Create original content' },
];

const StartPage = () => (
	<div className="min-h-screen bg-neutral-950 flex flex-col">
		<div className="flex-1 flex flex-col md:flex-row">
			{/* Auth panel */}
			<div className="flex-1 flex flex-col items-center justify-center px-8 py-16 gap-8">
				<div className="text-center">
					<h1 className="text-5xl font-bold tracking-tight text-white mb-3">
						Pars
					</h1>
					<p className={cn(TYPOGRAPHY.TEXT.base, COLORS.textMuted)}>
						A place to share ideas and connect.
					</p>
				</div>

				<div className="flex flex-col gap-3 w-full max-w-xs">
					<Link
						to="/signup"
						className="text-center rounded-md bg-white text-neutral-950 px-5 py-2.5 text-sm font-medium hover:bg-neutral-200 transition-colors"
					>
						Get started
					</Link>
					<Link
						to="/login"
						className="text-center rounded-md border border-neutral-700 text-neutral-200 px-5 py-2.5 text-sm font-medium hover:border-neutral-500 hover:text-white transition-colors"
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

			{/* Feature highlights panel */}
			<div className="flex-1 flex items-center justify-center px-8 py-16 bg-neutral-900 border-t md:border-t-0 md:border-l border-neutral-800">
				<ul className="flex flex-col gap-5">
					{features.map(({ icon: Icon, label }) => (
						<li key={label} className="flex items-center gap-4">
							<div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">
								<Icon className="w-5 h-5 text-violet-400" />
							</div>
							<span className={cn(TYPOGRAPHY.TEXT.lg, COLORS.textSecondary)}>
								{label}
							</span>
						</li>
					))}
				</ul>
			</div>
		</div>

		<Footer />
	</div>
);

export default StartPage;
