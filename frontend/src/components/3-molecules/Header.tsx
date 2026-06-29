import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { authClient } from '../../lib/auth';
import { cn } from '../../lib/utils';
import { BORDERS, COLORS, ZINDEX } from '../1-ions';

const navLinkClass = cn(
	'px-3 py-1.5 rounded-md text-sm transition-colors',
	COLORS.textSecondary,
	'hover:text-white hover:bg-neutral-800',
	'[&.active]:text-white [&.active]:bg-neutral-800',
);

const Header = () => {
	const navigate = useNavigate();
	const { data: session } = authClient.useSession();
	const [menuOpen, setMenuOpen] = useState(false);

	const handleLogout = async () => {
		await authClient.signOut();
		navigate({ to: '/' });
	};

	return (
		<header
			className={cn(
				'sticky top-0 flex h-12 items-center px-4 gap-4',
				'border-b',
				COLORS.bg,
				COLORS.border,
				ZINDEX.header,
			)}
		>
			<Link
				to="/home"
				className="font-bold text-lg tracking-tight text-white select-none"
			>
				Pars
			</Link>

			<nav className="flex items-center gap-1 flex-1">
				<Link to="/home" className={navLinkClass}>
					Home
				</Link>
				<Link to="/explore" className={navLinkClass}>
					Explore
				</Link>
			</nav>

			<div className="relative">
				<button
					type="button"
					onClick={() => setMenuOpen((o) => !o)}
					className={cn(
						'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors',
						COLORS.textSecondary,
						'hover:text-white hover:bg-neutral-800',
					)}
				>
					<span
						className={cn(
							'w-6 h-6 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-medium uppercase',
						)}
					>
						{session?.user?.name?.[0] ?? '?'}
					</span>
					<span className="hidden sm:inline">
						{session?.user?.name ?? 'Account'}
					</span>
				</button>

				{menuOpen && (
					<>
						<button
							type="button"
							aria-label="Close menu"
							tabIndex={-1}
							className={cn(
								'fixed inset-0 cursor-default bg-transparent border-0 p-0',
								ZINDEX.header,
							)}
							onClick={() => setMenuOpen(false)}
						/>
						<div
							className={cn(
								'absolute right-0 top-full mt-1 w-44 rounded-md border shadow-xl py-1',
								COLORS.surface,
								COLORS.border,
								ZINDEX.drawer,
							)}
						>
							{session?.user && (
								<Link
									to="/u/$username"
									params={{ username: session.user.name }}
									className={cn(
										'block px-3 py-2 text-sm',
										COLORS.textSecondary,
										'hover:text-white hover:bg-neutral-800',
									)}
									onClick={() => setMenuOpen(false)}
								>
									Profile
								</Link>
							)}
							<Link
								to="/settings"
								className={cn(
									'block px-3 py-2 text-sm',
									COLORS.textSecondary,
									'hover:text-white hover:bg-neutral-800',
								)}
								onClick={() => setMenuOpen(false)}
							>
								Settings
							</Link>
							<div className={cn('my-1 border-t', COLORS.border)} />
							<button
								type="button"
								onClick={handleLogout}
								className={cn(
									'w-full text-left px-3 py-2 text-sm',
									COLORS.danger,
									COLORS.dangerHover,
									'hover:bg-neutral-800',
								)}
							>
								Log out
							</button>
						</div>
					</>
				)}
			</div>
		</header>
	);
};

export default Header;
