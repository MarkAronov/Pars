import { useParams } from '@tanstack/react-router';
import { usePosts } from '../../hooks/usePosts';
import { useUser } from '../../hooks/useUser';
import PostCardGroup from '../3-molecules/PostCardGroup';
import UserCard from '../3-molecules/UserCard';

const UserPage = () => {
	const { username } = useParams({ from: '/u/$username' });
	const {
		data: user,
		isLoading: userLoading,
		isError: userError,
	} = useUser(username);
	const { data: posts, isLoading: postsLoading } = usePosts(1, 20);

	if (userError) {
		return (
			<div className="py-16 text-center">
				<p className="text-neutral-400">User not found.</p>
			</div>
		);
	}

	const userPosts = posts?.filter((p) => p.author.username === username) ?? [];

	return (
		<div className="flex flex-col gap-6">
			{userLoading || !user ? (
				<UserCard
					user={{
						id: '',
						username: null,
						displayName: null,
						bio: null,
						avatarUrl: null,
						backgroundUrl: null,
						role: 'user',
						verified: false,
						createdAt: '',
						_count: { followers: 0, following: 0, posts: 0 },
					}}
					isLoading
				/>
			) : (
				<UserCard user={user} />
			)}

			<div className="flex flex-col gap-3">
				<h3 className="text-sm font-medium text-neutral-400">Posts</h3>
				{postsLoading ? (
					<p className="text-sm text-neutral-600 py-4 text-center">Loading…</p>
				) : (
					<PostCardGroup posts={userPosts} />
				)}
			</div>
		</div>
	);
};

export default UserPage;
