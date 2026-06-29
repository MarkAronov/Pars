import { Link } from '@tanstack/react-router';
import type { Post } from '../../hooks/usePosts';
import { useToggleLike } from '../../hooks/usePosts';
import { cn } from '../../lib/utils';
import { AVATAR, BORDERS, COLORS, GAP, PADDING, TYPOGRAPHY } from '../1-ions';

interface PostCardProps {
	post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
	const toggleLike = useToggleLike(post.id);
	const authorHandle =
		post.author.username ?? post.author.displayName ?? 'unknown';
	const date = new Date(post.createdAt).toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
	});

	return (
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
			<div className={cn('flex items-center', GAP.sm)}>
				<div
					className={cn(
						'rounded-full bg-neutral-800 flex items-center justify-center font-medium text-neutral-300 uppercase select-none',
						AVATAR.sm,
					)}
				>
					{authorHandle[0]}
				</div>
				<div className="flex flex-col min-w-0">
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
					</span>
				</div>
				{post.edited && (
					<span
						className={cn(
							'ml-auto shrink-0',
							TYPOGRAPHY.TEXT.xs,
							COLORS.textDisabled,
						)}
					>
						edited
					</span>
				)}
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
	);
};

export default PostCard;
