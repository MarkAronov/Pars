import { useQuery } from '@tanstack/react-query';
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
