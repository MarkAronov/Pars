import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { authClient } from '../../lib/auth';

const SignUpPage = () => {
	const navigate = useNavigate();
	const [form, setForm] = useState({
		name: '',
		email: '',
		password: '',
		passwordRepeat: '',
	});
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const passwordMismatch =
		form.password &&
		form.passwordRepeat &&
		form.password !== form.passwordRepeat;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (form.password !== form.passwordRepeat) {
			setError('Passwords do not match');
			return;
		}
		setError(null);
		setLoading(true);
		const { error: err } = await authClient.signUp.email({
			name: form.name,
			email: form.email,
			password: form.password,
		});
		setLoading(false);
		if (err) {
			setError(err.message ?? 'Sign-up failed');
			return;
		}
		navigate({ to: '/home' });
	};

	return (
		<div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
			<div className="w-full max-w-sm">
				<h1 className="text-2xl font-bold text-white mb-6 text-center">
					Create your account
				</h1>

				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<div className="flex flex-col gap-1.5">
						<label htmlFor="name" className="text-sm text-neutral-400">
							Display name
						</label>
						<input
							id="name"
							type="text"
							autoComplete="name"
							required
							value={form.name}
							onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
							className="rounded-md bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
						/>
					</div>

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
							autoComplete="new-password"
							required
							minLength={8}
							value={form.password}
							onChange={(e) =>
								setForm((f) => ({ ...f, password: e.target.value }))
							}
							className="rounded-md bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<label
							htmlFor="passwordRepeat"
							className="text-sm text-neutral-400"
						>
							Repeat password
						</label>
						<input
							id="passwordRepeat"
							type="password"
							autoComplete="new-password"
							required
							value={form.passwordRepeat}
							onChange={(e) =>
								setForm((f) => ({ ...f, passwordRepeat: e.target.value }))
							}
							className={`rounded-md bg-neutral-900 border px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 ${passwordMismatch ? 'border-red-500' : 'border-neutral-700'}`}
						/>
						{passwordMismatch && (
							<p className="text-xs text-red-400">Passwords do not match</p>
						)}
					</div>

					{error && <p className="text-sm text-red-400">{error}</p>}

					<button
						type="submit"
						disabled={loading || !!passwordMismatch}
						className="rounded-md bg-white text-neutral-950 px-4 py-2 text-sm font-medium hover:bg-neutral-200 disabled:opacity-50 transition-colors"
					>
						{loading ? 'Creating account…' : 'Create account'}
					</button>
				</form>

				<p className="mt-6 text-center text-sm text-neutral-500">
					Already have an account?{' '}
					<Link to="/login" className="text-neutral-300 hover:text-white">
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
};

export default SignUpPage;
