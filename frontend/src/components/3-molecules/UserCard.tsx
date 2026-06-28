import { useState } from 'react';
import type { UserProfile } from '../../hooks/useUser';
import { authClient } from '../../lib/auth';
import UserProfileEditDialog from '../2-atoms/Dialogs/UserProfileEditDialog';

interface UserCardProps {
	user: UserProfile;
	isLoading?: boolean;
}

const UserCard = ({ user, isLoading }: UserCardProps) => {
	const { data: session } = authClient.useSession();
	const [editOpen, setEditOpen] = useState(false);
	const isSelf = session?.user?.id === user.id;

	if (isLoading) {
		return (
			<div className="rounded-lg border border-neutral-800 overflow-hidden animate-pulse">
				<div className="h-28 bg-neutral-800" />
				<div className="px-4 py-4 flex flex-col gap-3">
					<div className="h-4 w-32 bg-neutral-800 rounded" />
					<div className="h-3 w-24 bg-neutral-800 rounded" />
					<div className="h-3 w-full bg-neutral-800 rounded" />
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="rounded-lg border border-neutral-800 overflow-hidden">
				{/* Background banner */}
				<div
					className="h-28 bg-neutral-800 relative"
					style={
						user.backgroundUrl
							? {
									backgroundImage: `url(${user.backgroundUrl})`,
									backgroundSize: 'cover',
									backgroundPosition: 'center',
								}
							: undefined
					}
				/>

				{/* Profile info */}
				<div className="px-4 pb-4 relative">
					{/* Avatar */}
					<div className="absolute -top-8 left-4 w-16 h-16 rounded-full border-2 border-neutral-950 bg-neutral-700 flex items-center justify-center text-xl font-bold text-white uppercase overflow-hidden">
						{user.avatarUrl ? (
							<img
								src={user.avatarUrl}
								alt=""
								className="w-full h-full object-cover"
							/>
						) : (
							(user.displayName ?? user.username ?? '?')[0]
						)}
					</div>

					<div className="flex items-start justify-end pt-2 pb-2 min-h-[2.5rem]">
						{isSelf && (
							<button
								type="button"
								onClick={() => setEditOpen(true)}
								className="px-3 py-1.5 text-xs rounded-md border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors"
							>
								Edit profile
							</button>
						)}
					</div>

					<div className="mt-4 flex flex-col gap-1">
						<h2 className="text-base font-semibold text-white">
							{user.displayName ?? user.username ?? 'Unknown'}
							{user.verified && (
								<span
									role="img"
									aria-label="Verified"
									className="ml-1.5 text-xs text-blue-400"
								>
									✓
								</span>
							)}
						</h2>
						{user.username && (
							<p className="text-sm text-neutral-500">@{user.username}</p>
						)}
						{user.bio && (
							<p className="text-sm text-neutral-300 mt-1 whitespace-pre-line">
								{user.bio}
							</p>
						)}
					</div>

					<div className="flex gap-4 mt-3 text-xs text-neutral-500">
						<span>
							<strong className="text-neutral-300">
								{user._count.following}
							</strong>{' '}
							Following
						</span>
						<span>
							<strong className="text-neutral-300">
								{user._count.followers}
							</strong>{' '}
							Followers
						</span>
						<span>
							<strong className="text-neutral-300">{user._count.posts}</strong>{' '}
							Posts
						</span>
					</div>
				</div>
			</div>

			{isSelf && (
				<UserProfileEditDialog
					open={editOpen}
					onClose={() => setEditOpen(false)}
					user={user}
				/>
			)}
		</>
	);
};

export default UserCard;
