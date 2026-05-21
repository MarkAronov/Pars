import { useParams } from '@tanstack/react-router';

const UserPage = () => {
	const { username } = useParams({ strict: false });

	return (
		<main className="p-8">
			<h1 className="text-2xl font-bold">{username ?? 'User'}</h1>
		</main>
	);
};

export default UserPage;
