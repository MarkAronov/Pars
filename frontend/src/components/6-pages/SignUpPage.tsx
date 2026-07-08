import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { authClient } from '../../lib/auth';
import { cn } from '../../lib/utils';
import { invalidateSessionCache } from '../../router';
import { BORDER, BORDERS, COLORS, HOVER, TYPOGRAPHY, WEIGHT } from '../1-ions';
import AuthLayout from '../5-templates/AuthLayout';

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
					Create your account
				</h1>

				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<div className="flex flex-col gap-1.5">
						<label
							htmlFor="name"
							className={cn(TYPOGRAPHY.TEXT.sm, COLORS.textMuted)}
						>
							Display name
						</label>
						<input
							id="name"
							type="text"
							autoComplete="name"
							required
							value={form.name}
							onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
							className={inputClass}
						/>
					</div>

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
							autoComplete="new-password"
							required
							minLength={8}
							value={form.password}
							onChange={(e) =>
								setForm((f) => ({ ...f, password: e.target.value }))
							}
							className={inputClass}
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<label
							htmlFor="passwordRepeat"
							className={cn(TYPOGRAPHY.TEXT.sm, COLORS.textMuted)}
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
							className={cn(
								BORDERS.RADIUS.md,
								COLORS.surface,
								'border',
								passwordMismatch ? COLORS.dangerBorder : COLORS.borderSubtle,
								'px-3 py-2',
								TYPOGRAPHY.TEXT.sm,
								COLORS.textPrimary,
								'placeholder-neutral-500',
								BORDER.focus,
							)}
						/>
						{passwordMismatch && (
							<p className={cn(TYPOGRAPHY.TEXT.xs, COLORS.danger)}>
								Passwords do not match
							</p>
						)}
					</div>

					{error && (
						<p className={cn(TYPOGRAPHY.TEXT.sm, COLORS.danger)}>{error}</p>
					)}

					<button
						type="submit"
						disabled={loading || !!passwordMismatch}
						className={cn(
							BORDERS.RADIUS.md,
							'bg-white text-neutral-950 px-4 py-2',
							TYPOGRAPHY.TEXT.sm,
							WEIGHT.medium,
							'hover:bg-neutral-200 disabled:opacity-50 transition-colors',
						)}
					>
						{loading ? 'Creating account…' : 'Create account'}
					</button>
				</form>

				<p
					className={cn(
						'mt-6 text-center',
						TYPOGRAPHY.TEXT.sm,
						COLORS.textMuted,
					)}
				>
					Already have an account?{' '}
					<Link to="/login" className={cn(COLORS.textSecondary, HOVER.text)}>
						Sign in
					</Link>
				</p>
			</div>
		</AuthLayout>
	);
};

export default SignUpPage;
