import { Link } from '@tanstack/react-router';
import type { Post } from '../../hooks/usePosts';
import { useToggleLike } from '../../hooks/usePosts';

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
		<article className="border border-neutral-800 rounded-lg p-4 flex flex-col gap-3 hover:border-neutral-700 transition-colors bg-neutral-950">
			<div className="flex items-center gap-2">
				<div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-medium text-neutral-300 uppercase select-none">
					{authorHandle[0]}
				</div>
				<div className="flex flex-col min-w-0">
					<Link
						to="/u/$username"
						params={{ username: authorHandle }}
						className="text-sm font-medium text-white hover:underline truncate"
					>
						{post.author.displayName ?? authorHandle}
					</Link>
					<span className="text-xs text-neutral-500">
						@{authorHandle} · {date}
					</span>
				</div>
				{post.edited && (
					<span className="ml-auto text-xs text-neutral-600 shrink-0">
						edited
					</span>
				)}
			</div>

			{post.title && (
				<h3 className="text-base font-semibold text-white leading-snug">
					{post.title}
				</h3>
			)}

			<p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
				{post.content}
			</p>

			<div className="flex items-center gap-4 pt-1">
				<button
					type="button"
					onClick={() => toggleLike.mutate()}
					className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-red-400 transition-colors"
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

				<span className="text-xs text-neutral-600">
					{post._count.mentionedBy} replies
				</span>
			</div>
		</article>
	);
};

export default PostCard;
