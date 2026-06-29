import { Link } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { Compass, Home, Settings } from 'lucide-react';
import { authClient } from '../../lib/auth';
import { cn } from '../../lib/utils';
import { AVATAR, COLORS, TYPOGRAPHY, ZINDEX } from '../1-ions';

interface DrawerProps {
	open: boolean;
	onClose: () => void;
}

const NAV = [
	{ to: '/home' as const, label: 'Home', icon: Home },
	{ to: '/explore' as const, label: 'Explore', icon: Compass },
	{ to: '/settings' as const, label: 'Settings', icon: Settings },
];

const Drawer = ({ open, onClose }: DrawerProps) => {
	const { data: session } = authClient.useSession();

	return (
		<AnimatePresence>
			{open && (
				<>
					{/* Backdrop */}
					<motion.button
						type="button"
						aria-label="Close navigation"
						key="drawer-backdrop"
						className={cn('fixed inset-0 bg-black/50', ZINDEX.drawer)}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						onClick={onClose}
					/>

					{/* Panel */}
					<motion.nav
						key="drawer-panel"
						aria-label="Navigation"
						className={cn(
							'fixed top-0 left-0 h-full w-64 flex flex-col',
							COLORS.surface,
							'border-r border-neutral-800',
							ZINDEX.drawer,
						)}
						initial={{ x: '-100%' }}
						animate={{ x: 0 }}
						exit={{ x: '-100%' }}
						transition={{ type: 'spring', stiffness: 300, damping: 30 }}
					>
						{/* Logo */}
						<div className="flex items-center h-12 px-4 border-b border-neutral-800 shrink-0">
							<span className="font-bold text-lg tracking-tight text-white">
								Pars
							</span>
						</div>

						{/* Nav links */}
						<div className="flex-1 py-4 px-2 flex flex-col gap-1 overflow-y-auto">
							{NAV.map(({ to, label, icon: Icon }) => (
								<Link
									key={to}
									to={to}
									onClick={onClose}
									className={cn(
										'flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors',
										TYPOGRAPHY.TEXT.sm,
										COLORS.textSecondary,
										'hover:text-white hover:bg-neutral-800',
										'[&.active]:text-white [&.active]:bg-neutral-800',
									)}
								>
									<Icon className="w-4 h-4 shrink-0" />
									{label}
								</Link>
							))}
						</div>

						{/* User footer */}
						{session?.user && (
							<div className="shrink-0 px-4 py-4 border-t border-neutral-800 flex items-center gap-3">
								<div
									className={cn(
										'rounded-full bg-neutral-700 flex items-center justify-center font-medium text-white uppercase shrink-0',
										AVATAR.sm,
									)}
								>
									{session.user.name?.[0] ?? '?'}
								</div>
								<div className="flex flex-col min-w-0">
									<span
										className={cn(
											TYPOGRAPHY.TEXT.sm,
											'text-white font-medium truncate',
										)}
									>
										{session.user.name}
									</span>
									<span
										className={cn(
											TYPOGRAPHY.TEXT.xs,
											COLORS.textMuted,
											'truncate',
										)}
									>
										{session.user.email}
									</span>
								</div>
							</div>
						)}
					</motion.nav>
				</>
			)}
		</AnimatePresence>
	);
};

export default Drawer;
