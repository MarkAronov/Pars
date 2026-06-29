import { useEffect, useState } from 'react';
import type { Post } from '../../../hooks/usePosts';
import { useEditPost } from '../../../hooks/usePosts';
import { cn } from '../../../lib/utils';
import { BORDERS, COLORS, TYPOGRAPHY } from '../../1-ions';

interface Props {
	post: Post;
	open: boolean;
	onClose: () => void;
}

const EditPostDialog = ({ post, open, onClose }: Props) => {
	const editPost = useEditPost();
	const [form, setForm] = useState({
		title: post.title ?? '',
		content: post.content,
	});
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (open) {
			setForm({ title: post.title ?? '', content: post.content });
			setError(null);
		}
	}, [open, post]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.content.trim()) return;
		setError(null);
		try {
			await editPost.mutateAsync({
				postId: post.id,
				data: {
					title: form.title.trim() || undefined,
					content: form.content.trim(),
				},
			});
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to update post');
		}
	};

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-60 flex items-center justify-center p-4">
			<button
				type="button"
				aria-label="Close dialog"
				className="absolute inset-0 bg-black/60 cursor-default border-0 p-0 w-full h-full"
				onClick={onClose}
			/>

			<div
				className={cn(
					'relative z-10 w-full max-w-md flex flex-col gap-4',
					BORDERS.RADIUS.lg,
					'bg-neutral-900 border border-neutral-800 shadow-2xl p-6',
				)}
			>
				<h2 className={cn(TYPOGRAPHY.TEXT.base, 'font-semibold text-white')}>
					Edit post
				</h2>

				<form onSubmit={handleSubmit} className="flex flex-col gap-3">
					<div className="flex flex-col gap-1.5">
						<label
							htmlFor="edit-title"
							className={cn(TYPOGRAPHY.TEXT.xs, COLORS.textMuted)}
						>
							Title (optional)
						</label>
						<input
							id="edit-title"
							type="text"
							value={form.title}
							onChange={(e) =>
								setForm((f) => ({ ...f, title: e.target.value }))
							}
							maxLength={120}
							className="rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<label
							htmlFor="edit-content"
							className={cn(TYPOGRAPHY.TEXT.xs, COLORS.textMuted)}
						>
							Content
						</label>
						<textarea
							id="edit-content"
							rows={5}
							required
							value={form.content}
							onChange={(e) =>
								setForm((f) => ({ ...f, content: e.target.value }))
							}
							className="rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 resize-none"
						/>
					</div>

					{error && (
						<p className={cn(TYPOGRAPHY.TEXT.xs, 'text-red-400')}>{error}</p>
					)}

					<div className="flex justify-end gap-2 pt-1">
						<button
							type="button"
							onClick={onClose}
							className={cn(
								TYPOGRAPHY.TEXT.sm,
								COLORS.textMuted,
								'hover:text-white transition-colors px-3 py-1.5',
							)}
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={editPost.isPending || !form.content.trim()}
							className="px-4 py-1.5 text-sm rounded-md bg-white text-neutral-950 font-medium hover:bg-neutral-200 disabled:opacity-50 transition-colors"
						>
							{editPost.isPending ? 'Saving…' : 'Save'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default EditPostDialog;
