import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { authClient } from '../../lib/auth';

const LoginPage = () => {
	const navigate = useNavigate();
	const [form, setForm] = useState({ email: '', password: '' });
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);
		const { error: err } = await authClient.signIn.email({
			email: form.email,
			password: form.password,
		});
		setLoading(false);
		if (err) {
			setError(err.message ?? 'Login failed');
			return;
		}
		navigate({ to: '/home' });
	};

	return (
		<div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
			<div className="w-full max-w-sm">
				<h1 className="text-2xl font-bold text-white mb-6 text-center">
					Sign in to Pars
				</h1>

				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<div className="flex flex-col gap-1.5">
						<label htmlFor="email" className="text-sm text-neutral-400">
							Email
						</label>
						<input
							id="email"
							type="email"
							autoComplete="email"
							required
							value={form.email}
							onChange={(e) =>
								setForm((f) => ({ ...f, email: e.target.value }))
							}
							className="rounded-md bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<label htmlFor="password" className="text-sm text-neutral-400">
							Password
						</label>
						<input
							id="password"
							type="password"
							autoComplete="current-password"
							required
							value={form.password}
							onChange={(e) =>
								setForm((f) => ({ ...f, password: e.target.value }))
							}
							className="rounded-md bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
						/>
					</div>

					{error && <p className="text-sm text-red-400">{error}</p>}

					<button
						type="submit"
						disabled={loading}
						className="rounded-md bg-white text-neutral-950 px-4 py-2 text-sm font-medium hover:bg-neutral-200 disabled:opacity-50 transition-colors"
					>
						{loading ? 'Signing in…' : 'Sign in'}
					</button>
				</form>

				<p className="mt-4 text-center text-sm text-neutral-500">
					<Link
						to="/forgot-password"
						className="text-neutral-400 hover:text-neutral-300 transition-colors"
					>
						Forgot password?
					</Link>
				</p>

				<p className="mt-2 text-center text-sm text-neutral-500">
					New to Pars?{' '}
					<Link to="/signup" className="text-neutral-300 hover:text-white">
						Create an account
					</Link>
				</p>
			</div>
		</div>
	);
};

export default LoginPage;
