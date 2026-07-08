import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface UserProfile {
	id: string;
	username: string | null;
	displayName: string | null;
	bio: string | null;
	avatarUrl: string | null;
	backgroundUrl: string | null;
	role: string;
	verified: boolean;
	createdAt: string;
	_count: { followers: number; following: number; posts: number };
}

export function useUser(idOrUsername: string) {
	return useQuery({
		queryKey: ['users', idOrUsername],
		queryFn: () => api.get<UserProfile>(`/api/users/${idOrUsername}`),
		staleTime: 30_000,
		retry: 1,
	});
}

export function useSelfUser() {
	return useQuery({
		queryKey: ['users', 'me'],
		queryFn: () => api.get<UserProfile>('/api/users/me'),
		staleTime: 30_000,
		retry: 1,
	});
}

export function useIsFollowing(targetId: string) {
	return useQuery({
		queryKey: ['users', targetId, 'following-status'],
		queryFn: () =>
			api.get<{ isFollowing: boolean }>(
				`/api/users/${targetId}/following-status`,
			),
		staleTime: 30_000,
		retry: 1,
		enabled: !!targetId,
	});
}

export function useFollowUser(targetId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () =>
			api.post<{ following: boolean }>(`/api/users/${targetId}/follow`),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['users', targetId] });
			qc.invalidateQueries({
				queryKey: ['users', targetId, 'following-status'],
			});
		},
	});
}

export function useUnfollowUser(targetId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () =>
			api.delete<{ following: boolean }>(`/api/users/${targetId}/follow`),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['users', targetId] });
			qc.invalidateQueries({
				queryKey: ['users', targetId, 'following-status'],
			});
		},
	});
}
