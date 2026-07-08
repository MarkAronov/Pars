import { Compass, MessageSquare, Pencil, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { COLORS, TYPOGRAPHY } from '../1-ions';
import Footer from '../3-molecules/Footer';

const features = [
	{ icon: Compass, label: 'Follow your interests' },
	{ icon: Users, label: 'Connect with people' },
	{ icon: MessageSquare, label: 'Join the conversation' },
	{ icon: Pencil, label: 'Create original content' },
];

interface AuthLayoutProps {
	children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => (
	<div className={cn('min-h-screen flex flex-col', COLORS.bg)}>
		<div className="flex-1 flex flex-col md:flex-row-reverse">
			{/* Right panel: form / CTA content */}
			<div className="flex-1 flex flex-col items-center justify-center px-8 py-16">
				{children}
			</div>

			{/* Left panel: feature highlights */}
			<div
				className={cn(
					'flex-1 flex items-center justify-center px-8 py-16',
					'border-b md:border-b-0 md:border-r',
					COLORS.surface,
					COLORS.border,
				)}
			>
				<ul className="flex flex-col gap-5">
					{features.map(({ icon: Icon, label }) => (
						<li key={label} className="flex items-center gap-4">
							<div
								className={cn(
									'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
									COLORS.surfaceRaised,
								)}
							>
								<Icon className={cn('w-5 h-5', COLORS.accent)} />
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

export default AuthLayout;
