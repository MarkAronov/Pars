import { useState } from 'react';
import { useFeed } from '../../hooks/useFeed';
import { useCreatePost } from '../../hooks/usePosts';
import PostCardGroup from '../3-molecules/PostCardGroup';

const CreatePostForm = ({ onCreated }: { onCreated: () => void }) => {
	const [content, setContent] = useState('');
	const createPost = useCreatePost();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!content.trim()) return;
		await createPost.mutateAsync({ content });
		setContent('');
		onCreated();
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col gap-2 border border-neutral-800 rounded-lg p-4"
		>
			<textarea
				rows={3}
				placeholder="What's on your mind?"
				value={content}
				onChange={(e) => setContent(e.target.value)}
				className="bg-transparent text-sm text-white placeholder-neutral-600 resize-none focus:outline-none"
			/>
			<div className="flex justify-end">
				<button
					type="submit"
					disabled={!content.trim() || createPost.isPending}
					className="px-4 py-1.5 text-sm rounded-md bg-white text-neutral-950 font-medium hover:bg-neutral-200 disabled:opacity-50 transition-colors"
				>
					{createPost.isPending ? 'Posting…' : 'Post'}
				</button>
			</div>
		</form>
	);
};

const PostSkeleton = () => (
	<div className="border border-neutral-800 rounded-lg p-4 animate-pulse flex flex-col gap-3">
		<div className="flex gap-2 items-center">
			<div className="w-8 h-8 rounded-full bg-neutral-800" />
			<div className="h-3 w-24 bg-neutral-800 rounded" />
		</div>
		<div className="h-3 w-full bg-neutral-800 rounded" />
		<div className="h-3 w-3/4 bg-neutral-800 rounded" />
	</div>
);

const HomePage = () => {
	const [page] = useState(1);
	const { data, isLoading, isError, refetch } = useFeed(page);

	return (
		<div className="flex flex-col gap-6">
			<CreatePostForm onCreated={() => refetch()} />

			{isLoading && (
				<div className="flex flex-col gap-3">
					{[1, 2, 3].map((n) => (
						<PostSkeleton key={n} />
					))}
				</div>
			)}

			{isError && (
				<p className="text-sm text-red-400 text-center py-8">
					Failed to load feed.
				</p>
			)}

			{data && <PostCardGroup posts={data.posts} />}
		</div>
	);
};

export default HomePage;
