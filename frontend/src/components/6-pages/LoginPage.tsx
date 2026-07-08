import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { authClient } from '../../lib/auth';
import { cn } from '../../lib/utils';
import { invalidateSessionCache } from '../../router';
import { BORDER, BORDERS, COLORS, HOVER, TYPOGRAPHY, WEIGHT } from '../1-ions';
import AuthLayout from '../5-templates/AuthLayout';

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
		invalidateSessionCache();
		navigate({ to: '/home' });
	};

	const inputClass = cn(
		BORDERS.RADIUS.md,
		COLORS.surface,
		BORDER.subtle,
		'px-3 py-2',
		TYPOGRAPHY.TEXT.sm,
		COLORS.textPrimary,
		'placeholder-neutral-500',
		BORDER.focus,
	);

	return (
		<AuthLayout>
			<div className="w-full max-w-sm">
				<h1
					className={cn(
						TYPOGRAPHY.TEXT['2xl'],
						WEIGHT.bold,
						'text-white mb-6 text-center',
					)}
				>
					Sign in to Pars
				</h1>

				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<div className="flex flex-col gap-1.5">
						<label
							htmlFor="email"
							className={cn(TYPOGRAPHY.TEXT.sm, COLORS.textMuted)}
						>
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
							className={inputClass}
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<label
							htmlFor="password"
							className={cn(TYPOGRAPHY.TEXT.sm, COLORS.textMuted)}
						>
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
							className={inputClass}
						/>
					</div>

					{error && (
						<p className={cn(TYPOGRAPHY.TEXT.sm, COLORS.danger)}>{error}</p>
					)}

					<button
						type="submit"
						disabled={loading}
						className={cn(
							BORDERS.RADIUS.md,
							'bg-white text-neutral-950 px-4 py-2',
							TYPOGRAPHY.TEXT.sm,
							WEIGHT.medium,
							'hover:bg-neutral-200 disabled:opacity-50 transition-colors',
						)}
					>
						{loading ? 'Signing in…' : 'Sign in'}
					</button>
				</form>

				<p
					className={cn(
						'mt-4 text-center',
						TYPOGRAPHY.TEXT.sm,
						COLORS.textMuted,
					)}
				>
					<Link
						to="/forgot-password"
						className={cn(
							COLORS.textSecondary,
							HOVER.text,
							'transition-colors',
						)}
					>
						Forgot password?
					</Link>
				</p>

				<p
					className={cn(
						'mt-2 text-center',
						TYPOGRAPHY.TEXT.sm,
						COLORS.textMuted,
					)}
				>
					New to Pars?{' '}
					<Link to="/signup" className={cn(COLORS.textSecondary, HOVER.text)}>
						Create an account
					</Link>
				</p>
			</div>
		</AuthLayout>
	);
};

export default LoginPage;
