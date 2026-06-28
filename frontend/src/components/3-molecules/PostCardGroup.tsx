import type { Post } from '../../hooks/usePosts';
import PostCard from '../2-atoms/PostCard';

interface PostCardGroupProps {
	posts: Post[];
}

const PostCardGroup = ({ posts }: PostCardGroupProps) => {
	if (posts.length === 0) {
		return (
			<p className="text-sm text-neutral-500 py-8 text-center">No posts yet.</p>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			{posts.map((post) => (
				<PostCard key={post.id} post={post} />
			))}
		</div>
	);
};

export default PostCardGroup;
