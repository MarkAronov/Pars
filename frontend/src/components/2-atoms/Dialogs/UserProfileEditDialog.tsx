import { useEffect, useState } from 'react';
import type { UserProfile } from '../../../hooks/useUser';
import { api } from '../../../lib/api';

interface Props {
	open: boolean;
	onClose: () => void;
	user: UserProfile;
}

const UserProfileEditDialog = ({ open, onClose, user }: Props) => {
	const [form, setForm] = useState({
		displayName: user.displayName ?? '',
		bio: user.bio ?? '',
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (open) {
			setForm({ displayName: user.displayName ?? '', bio: user.bio ?? '' });
			setError(null);
		}
	}, [open, user]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			await api.patch('/api/users/me', {
				displayName: form.displayName || undefined,
				bio: form.bio || undefined,
			});
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Update failed');
		} finally {
			setLoading(false);
		}
	};

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<button
				type="button"
				aria-label="Close dialog"
				className="absolute inset-0 bg-black/60 cursor-default border-0 p-0 w-full h-full"
				onClick={onClose}
			/>

			<div className="relative z-10 w-full max-w-sm rounded-lg bg-neutral-900 border border-neutral-800 shadow-2xl p-6 flex flex-col gap-4">
				<h2 className="text-base font-semibold text-white">Edit profile</h2>

				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<div className="flex flex-col gap-1.5">
						<label htmlFor="displayName" className="text-xs text-neutral-400">
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
							className="rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<label htmlFor="bio" className="text-xs text-neutral-400">
							Bio
						</label>
						<textarea
							id="bio"
							rows={3}
							value={form.bio}
							onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
							maxLength={280}
							className="rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 resize-none"
						/>
					</div>

					{error && <p className="text-xs text-red-400">{error}</p>}

					<div className="flex justify-end gap-2 pt-1">
						<button
							type="button"
							onClick={onClose}
							className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading}
							className="px-4 py-1.5 text-sm rounded-md bg-white text-neutral-950 font-medium hover:bg-neutral-200 disabled:opacity-50 transition-colors"
						>
							{loading ? 'Saving…' : 'Save'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default UserProfileEditDialog;
