import { useEffect, useState } from 'react';
import { useSelfUser } from '../../hooks/useUser';
import { api } from '../../lib/api';
import { cn } from '../../lib/utils';
import { COLORS, TYPOGRAPHY } from '../1-ions';

const ProfileSection = () => {
	const { data: user, refetch } = useSelfUser();
	const [form, setForm] = useState({ displayName: '', bio: '' });
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (user)
			setForm({ displayName: user.displayName ?? '', bio: user.bio ?? '' });
	}, [user]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setSuccess(false);
		try {
			await api.patch('/api/users/me', {
				displayName: form.displayName.trim() || undefined,
				bio: form.bio.trim() || undefined,
			});
			await refetch();
			setSuccess(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Update failed');
		} finally {
			setLoading(false);
		}
	};

	return (
		<section
			className={cn(
				'rounded-lg border border-neutral-800 p-6 flex flex-col gap-4',
			)}
		>
			<h3 className={cn(TYPOGRAPHY.TEXT.base, 'font-semibold text-white')}>
				Profile
			</h3>
			<form onSubmit={handleSubmit} className="flex flex-col gap-4">
				<div className="flex flex-col gap-1.5">
					<label
						htmlFor="displayName"
						className={cn(TYPOGRAPHY.TEXT.sm, COLORS.textMuted)}
					>
						Display name
					</label>
					<input
						id="displayName"
						type="text"
						value={form.displayName}
						onChange={(e) =>
							setForm((f) => ({ ...f, displayName: e.target.value }))
						}
						maxLength={60}
						className="rounded-md bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-neutral-500"
					/>
				</div>
				<div className="flex flex-col gap-1.5">
					<label
						htmlFor="bio"
						className={cn(TYPOGRAPHY.TEXT.sm, COLORS.textMuted)}
					>
						Bio
					</label>
					<textarea
						id="bio"
						rows={3}
						value={form.bio}
						onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
						maxLength={280}
						className="rounded-md bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-neutral-500 resize-none"
					/>
				</div>
				{error && (
					<p className={cn(TYPOGRAPHY.TEXT.sm, 'text-red-400')}>{error}</p>
				)}
				{success && (
					<p className={cn(TYPOGRAPHY.TEXT.sm, 'text-green-400')}>
						Profile updated.
					</p>
				)}
				<div className="flex justify-end">
					<button
						type="submit"
						disabled={loading}
						className="px-4 py-1.5 text-sm rounded-md bg-white text-neutral-950 font-medium hover:bg-neutral-200 disabled:opacity-50 transition-colors"
					>
						{loading ? 'Saving…' : 'Save changes'}
					</button>
				</div>
			</form>
		</section>
	);
};

const PasswordSection = () => {
	const [form, setForm] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	});
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const mismatch =
		form.newPassword &&
		form.confirmPassword &&
		form.newPassword !== form.confirmPassword;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (form.newPassword !== form.confirmPassword) {
			setError('Passwords do not match');
			return;
		}
		setLoading(true);
		setError(null);
		setSuccess(false);
		try {
			await api.patch('/api/users/me/password', {
				currentPassword: form.currentPassword,
				newPassword: form.newPassword,
			});
			setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
			setSuccess(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Password change failed');
		} finally {
			setLoading(false);
		}
	};

	return (
		<section className="rounded-lg border border-neutral-800 p-6 flex flex-col gap-4">
			<h3 className={cn(TYPOGRAPHY.TEXT.base, 'font-semibold text-white')}>
				Change password
			</h3>
			<form onSubmit={handleSubmit} className="flex flex-col gap-4">
				{(['currentPassword', 'newPassword', 'confirmPassword'] as const).map(
					(key) => (
						<div key={key} className="flex flex-col gap-1.5">
							<label
								htmlFor={key}
								className={cn(TYPOGRAPHY.TEXT.sm, COLORS.textMuted)}
							>
								{key === 'currentPassword'
									? 'Current password'
									: key === 'newPassword'
										? 'New password'
										: 'Confirm new password'}
							</label>
							<input
								id={key}
								type="password"
								autoComplete={
									key === 'currentPassword'
										? 'current-password'
										: 'new-password'
								}
								required
								minLength={key === 'newPassword' ? 8 : undefined}
								value={form[key]}
								onChange={(e) =>
									setForm((f) => ({ ...f, [key]: e.target.value }))
								}
								className={cn(
									'rounded-md bg-neutral-900 border px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-neutral-500',
									key === 'confirmPassword' && mismatch
										? 'border-red-500'
										: 'border-neutral-700',
								)}
							/>
							{key === 'confirmPassword' && mismatch && (
								<p className={cn(TYPOGRAPHY.TEXT.xs, 'text-red-400')}>
									Passwords do not match
								</p>
							)}
						</div>
					),
				)}
				{error && (
					<p className={cn(TYPOGRAPHY.TEXT.sm, 'text-red-400')}>{error}</p>
				)}
				{success && (
					<p className={cn(TYPOGRAPHY.TEXT.sm, 'text-green-400')}>
						Password changed.
					</p>
				)}
				<div className="flex justify-end">
					<button
						type="submit"
						disabled={loading || !!mismatch}
						className="px-4 py-1.5 text-sm rounded-md bg-white text-neutral-950 font-medium hover:bg-neutral-200 disabled:opacity-50 transition-colors"
					>
						{loading ? 'Updating…' : 'Update password'}
					</button>
				</div>
			</form>
		</section>
	);
};

const SettingsPage = () => (
	<div className="flex flex-col gap-6">
		<h2 className={cn(TYPOGRAPHY.TEXT['2xl'], 'font-semibold text-white')}>
			Settings
		</h2>
		<ProfileSection />
		<PasswordSection />
	</div>
);

export default SettingsPage;
