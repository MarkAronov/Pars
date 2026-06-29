import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { COLORS, TYPOGRAPHY } from '../1-ions';

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState('');
	const [sent, setSent] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		// TODO: call authClient.forgetPassword once the backend configures sendResetPassword
		await new Promise((r) => setTimeout(r, 600));
		setLoading(false);
		setSent(true);
	};

	return (
		<div
			className={cn(
				'min-h-screen flex items-center justify-center px-4',
				COLORS.bg,
			)}
		>
			<div className="w-full max-w-sm">
				<h1
					className={cn(
						TYPOGRAPHY.TEXT['2xl'],
						TYPOGRAPHY.WEIGHT.bold,
						'text-white mb-2 text-center',
					)}
				>
					Reset your password
				</h1>
				<p
					className={cn(
						TYPOGRAPHY.TEXT.sm,
						COLORS.textMuted,
						'text-center mb-6',
					)}
				>
					Enter your email and we'll send you a reset link.
				</p>

				{sent ? (
					<div className="rounded-md bg-neutral-900 border border-neutral-800 p-4 text-center">
						<p className={cn(TYPOGRAPHY.TEXT.sm, COLORS.textSecondary)}>
							Check your email — a reset link is on its way.
						</p>
					</div>
				) : (
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
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="rounded-md bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="rounded-md bg-white text-neutral-950 px-4 py-2 text-sm font-medium hover:bg-neutral-200 disabled:opacity-50 transition-colors"
						>
							{loading ? 'Sending…' : 'Send reset link'}
						</button>
					</form>
				)}

				<p
					className={cn(
						'mt-6 text-center',
						TYPOGRAPHY.TEXT.sm,
						COLORS.textMuted,
					)}
				>
					<Link
						to="/login"
						className="text-neutral-300 hover:text-white transition-colors"
					>
						← Back to sign in
					</Link>
				</p>
			</div>
		</div>
	);
};

export default ForgotPasswordPage;
