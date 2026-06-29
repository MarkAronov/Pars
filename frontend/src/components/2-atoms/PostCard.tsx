import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import type { Post } from '../../hooks/usePosts';
import { useDeletePost, useToggleLike } from '../../hooks/usePosts';
import { authClient } from '../../lib/auth';
import { cn } from '../../lib/utils';
import { AVATAR, BORDERS, COLORS, GAP, PADDING, TYPOGRAPHY } from '../1-ions';
import EditPostDialog from './Dialogs/EditPostDialog';
import PostOptionsMenu from './PostOptionsMenu';
import ViewMediaDialog from './ViewMediaDialog';

interface PostCardProps {
	post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
	const toggleLike = useToggleLike(post.id);
	const deletePost = useDeletePost();
	const { data: session } = authClient.useSession();
	const [mediaViewer, setMediaViewer] = useState<string | null>(null);
	const [editOpen, setEditOpen] = useState(false);

	const authorHandle =
		post.author.username ?? post.author.displayName ?? 'unknown';
	const isOwn = session?.user?.id === post.author.id;
	const date = new Date(post.createdAt).toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
	});

	return (
		<>
			<article
				className={cn(
					'flex flex-col transition-colors',
					BORDERS.RADIUS.lg,
					BORDERS.BORDER.base,
					PADDING.card,
					GAP.md,
					COLORS.bg,
					'hover:border-neutral-700',
				)}
			>
				{/* Header row */}
				<div className={cn('flex items-center', GAP.sm)}>
					{post.author.avatarUrl ? (
						<img
							src={post.author.avatarUrl}
							alt=""
							className={cn('rounded-full object-cover shrink-0', AVATAR.sm)}
						/>
					) : (
						<div
							className={cn(
								'rounded-full bg-neutral-800 flex items-center justify-center font-medium text-neutral-300 uppercase select-none shrink-0',
								AVATAR.sm,
							)}
						>
							{authorHandle[0]}
						</div>
					)}
					<div className="flex flex-col min-w-0 flex-1">
						<Link
							to="/u/$username"
							params={{ username: authorHandle }}
							className={cn(
								TYPOGRAPHY.TEXT.sm,
								'font-medium text-white hover:underline truncate',
							)}
						>
							{post.author.displayName ?? authorHandle}
						</Link>
						<span className={cn(TYPOGRAPHY.TEXT.xs, COLORS.textMuted)}>
							@{authorHandle} · {date}
							{post.edited && (
								<span className={cn('ml-1.5', COLORS.textDisabled)}>
									· edited
								</span>
							)}
						</span>
					</div>
					<PostOptionsMenu
						isOwn={isOwn}
						onDelete={() => deletePost.mutate(post.id)}
						onEdit={() => setEditOpen(true)}
					/>
				</div>

				{post.title && (
					<h3
						className={cn(
							TYPOGRAPHY.TEXT.base,
							TYPOGRAPHY.WEIGHT.semibold,
							'text-white',
							TYPOGRAPHY.LEADING.snug,
						)}
					>
						{post.title}
					</h3>
				)}

				<p
					className={cn(
						TYPOGRAPHY.TEXT.sm,
						COLORS.textSecondary,
						'leading-relaxed whitespace-pre-line',
					)}
				>
					{post.content}
				</p>

				{/* Media grid */}
				{post.mediaFiles && post.mediaFiles.length > 0 && (
					<div
						className={cn(
							post.mediaFiles.length === 1
								? 'grid grid-cols-1'
								: 'grid grid-cols-2',
							GAP.sm,
						)}
					>
						{post.mediaFiles.map((src) => (
							<button
								key={src}
								type="button"
								onClick={() => setMediaViewer(src)}
								className="overflow-hidden rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
							>
								<img
									src={src}
									alt=""
									loading="lazy"
									className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
								/>
							</button>
						))}
					</div>
				)}

				{/* Action row */}
				<div className={cn('flex items-center pt-1', GAP.lg)}>
					<button
						type="button"
						onClick={() => toggleLike.mutate()}
						className={cn(
							'flex items-center gap-1.5 transition-colors',
							TYPOGRAPHY.TEXT.xs,
							COLORS.textMuted,
							'hover:text-red-400',
						)}
					>
						<svg
							className="w-4 h-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth={1.8}
							aria-hidden="true"
						>
							<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
						</svg>
						{post._count.likes}
					</button>
					<span className={cn(TYPOGRAPHY.TEXT.xs, COLORS.textDisabled)}>
						{post._count.mentionedBy} replies
					</span>
				</div>
			</article>

			{mediaViewer && (
				<ViewMediaDialog
					src={mediaViewer}
					open={!!mediaViewer}
					onOpenChange={(o) => {
						if (!o) setMediaViewer(null);
					}}
				/>
			)}

			<EditPostDialog
				post={post}
				open={editOpen}
				onClose={() => setEditOpen(false)}
			/>
		</>
	);
};

export default PostCard;
