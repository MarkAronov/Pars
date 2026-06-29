import { useState } from 'react';
import type { UserProfile } from '../../hooks/useUser';
import { authClient } from '../../lib/auth';
import { cn } from '../../lib/utils';
import { AVATAR, BORDERS, COLORS, GAP, PADDING, TYPOGRAPHY } from '../1-ions';
import UserProfileEditDialog from '../2-atoms/Dialogs/UserProfileEditDialog';
import ViewMediaDialog from '../2-atoms/ViewMediaDialog';

interface UserCardProps {
	user: UserProfile;
	isLoading?: boolean;
}

const UserCard = ({ user, isLoading }: UserCardProps) => {
	const { data: session } = authClient.useSession();
	const [editOpen, setEditOpen] = useState(false);
	const [mediaViewer, setMediaViewer] = useState<string | null>(null);
	const isSelf = session?.user?.id === user.id;

	if (isLoading) {
		return (
			<div
				className={cn(
					BORDERS.RADIUS.lg,
					'border border-neutral-800 overflow-hidden animate-pulse',
				)}
			>
				<div className="h-28 bg-neutral-800" />
				<div className={cn('flex flex-col', GAP.md, PADDING.card)}>
					<div className="h-4 w-32 bg-neutral-800 rounded" />
					<div className="h-3 w-24 bg-neutral-800 rounded" />
					<div className="h-3 w-full bg-neutral-800 rounded" />
				</div>
			</div>
		);
	}

	return (
		<>
			<div
				className={cn(
					BORDERS.RADIUS.lg,
					'border border-neutral-800 overflow-hidden',
				)}
			>
				{/* Background banner — clickable if URL exists */}
				{user.backgroundUrl ? (
					<button
						type="button"
						aria-label="View background image"
						onClick={() => setMediaViewer(user.backgroundUrl ?? '')}
						className="h-28 w-full bg-neutral-800 relative block cursor-pointer hover:opacity-90 transition-opacity"
						style={{
							backgroundImage: `url(${user.backgroundUrl})`,
							backgroundSize: 'cover',
							backgroundPosition: 'center',
						}}
					/>
				) : (
					<div className="h-28 bg-neutral-800 relative" />
				)}

				{/* Profile info */}
				<div className="px-4 pb-4 relative">
					{/* Avatar — button when URL exists so it's accessible + no non-null assertions */}
					{user.avatarUrl ? (
						<button
							type="button"
							aria-label="View avatar"
							onClick={() => setMediaViewer(user.avatarUrl ?? '')}
							className={cn(
								'absolute -top-8 left-4 rounded-full border-2 border-neutral-950 bg-neutral-700',
								'flex items-center justify-center font-bold text-white uppercase overflow-hidden',
								'cursor-pointer hover:opacity-90 transition-opacity p-0',
								AVATAR.lg,
							)}
						>
							<img
								src={user.avatarUrl}
								alt=""
								className="w-full h-full object-cover"
							/>
						</button>
					) : (
						<div
							className={cn(
								'absolute -top-8 left-4 rounded-full border-2 border-neutral-950 bg-neutral-700',
								'flex items-center justify-center font-bold text-white uppercase overflow-hidden',
								AVATAR.lg,
							)}
						>
							{(user.displayName ?? user.username ?? '?')[0]}
						</div>
					)}

					<div className="flex items-start justify-end pt-2 pb-2 min-h-[2.5rem]">
						{isSelf && (
							<button
								type="button"
								onClick={() => setEditOpen(true)}
								className={cn(
									'text-xs transition-colors',
									BORDERS.RADIUS.md,
									BORDERS.BORDER.subtle,
									PADDING.buttonSm,
									COLORS.textSecondary,
									'hover:text-white hover:border-neutral-500',
								)}
							>
								Edit profile
							</button>
						)}
					</div>

					<div className={cn('mt-4 flex flex-col', GAP.xs)}>
						<h2
							className={cn(
								TYPOGRAPHY.TEXT.base,
								TYPOGRAPHY.WEIGHT.semibold,
								'text-white',
							)}
						>
							{user.displayName ?? user.username ?? 'Unknown'}
							{user.verified && (
								<span
									role="img"
									aria-label="Verified"
									className={cn('ml-1.5', TYPOGRAPHY.TEXT.xs, COLORS.verified)}
								>
									✓
								</span>
							)}
						</h2>
						{user.username && (
							<p className={cn(TYPOGRAPHY.TEXT.sm, COLORS.textMuted)}>
								@{user.username}
							</p>
						)}
						{user.bio && (
							<p
								className={cn(
									TYPOGRAPHY.TEXT.sm,
									COLORS.textSecondary,
									'mt-1 whitespace-pre-line',
								)}
							>
								{user.bio}
							</p>
						)}
					</div>

					<div
						className={cn(
							'flex mt-3',
							GAP.lg,
							TYPOGRAPHY.TEXT.xs,
							COLORS.textMuted,
						)}
					>
						<span>
							<strong className={COLORS.textSecondary}>
								{user._count.following}
							</strong>{' '}
							Following
						</span>
						<span>
							<strong className={COLORS.textSecondary}>
								{user._count.followers}
							</strong>{' '}
							Followers
						</span>
						<span>
							<strong className={COLORS.textSecondary}>
								{user._count.posts}
							</strong>{' '}
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

			{mediaViewer && (
				<ViewMediaDialog
					src={mediaViewer}
					open={!!mediaViewer}
					onOpenChange={(o) => {
						if (!o) setMediaViewer(null);
					}}
				/>
			)}
		</>
	);
};

export default UserCard;
