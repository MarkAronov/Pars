import { useParams } from '@tanstack/react-router';

const UserPage = () => {
	const { username } = useParams({ from: '/app/u/$username' });

	return (
		<div className="flex flex-col gap-4">
			<div className="text-sm text-neutral-500">@{username}</div>
			<h1 className="text-2xl font-bold text-white">{username}</h1>
			<p className="text-neutral-400 text-sm">Profile coming soon.</p>
		</div>
	);
};

export default UserPage;
