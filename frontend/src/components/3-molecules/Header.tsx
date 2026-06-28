import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { authClient } from '../../lib/auth';

const Header = () => {
	const navigate = useNavigate();
	const { data: session } = authClient.useSession();
	const [menuOpen, setMenuOpen] = useState(false);

	const handleLogout = async () => {
		await authClient.signOut();
		navigate({ to: '/' });
	};

	return (
		<header className="sticky top-0 z-40 flex h-12 items-center border-b border-neutral-800 bg-neutral-950 px-4 gap-4">
			<Link
				to="/home"
				className="font-bold text-lg tracking-tight text-white select-none"
			>
				Pars
			</Link>

			<nav className="flex items-center gap-1 flex-1">
				<Link
					to="/home"
					className="px-3 py-1.5 rounded-md text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors [&.active]:text-white [&.active]:bg-neutral-800"
				>
					Home
				</Link>
				<Link
					to="/explore"
					className="px-3 py-1.5 rounded-md text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors [&.active]:text-white [&.active]:bg-neutral-800"
				>
					Explore
				</Link>
			</nav>

			<div className="relative">
				<button
					type="button"
					onClick={() => setMenuOpen((o) => !o)}
					className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
				>
					<span className="w-6 h-6 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-medium uppercase">
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
							className="fixed inset-0 z-40 cursor-default bg-transparent border-0 p-0"
							onClick={() => setMenuOpen(false)}
						/>
						<div className="absolute right-0 top-full mt-1 w-44 rounded-md border border-neutral-800 bg-neutral-900 shadow-xl z-50 py-1">
							{session?.user && (
								<Link
									to="/u/$username"
									params={{ username: session.user.name }}
									className="block px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800"
									onClick={() => setMenuOpen(false)}
								>
									Profile
								</Link>
							)}
							<Link
								to="/settings"
								className="block px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800"
								onClick={() => setMenuOpen(false)}
							>
								Settings
							</Link>
							<div className="my-1 border-t border-neutral-800" />
							<button
								type="button"
								onClick={handleLogout}
								className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-neutral-800"
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
