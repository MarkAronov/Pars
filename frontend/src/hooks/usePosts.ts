import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface Post {
	id: string;
	title: string | null;
	content: string;
	edited: boolean;
	createdAt: string;
	author: { id: string; username: string | null; displayName: string | null; avatarUrl: string | null; verified: boolean };
	_count: { likes: number; mentionedBy: number };
	threadId: string | null;
}

export function usePosts(page = 1, limit = 20) {
	return useQuery({
		queryKey: ['posts', page, limit],
		queryFn: () => api.get<Post[]>(`/api/posts?page=${page}&limit=${limit}`),
		staleTime: 30_000,
		retry: 1,
	});
}

export function usePost(id: string) {
	return useQuery({
		queryKey: ['posts', id],
		queryFn: () => api.get<Post>(`/api/posts/${id}`),
		staleTime: 30_000,
		retry: 1,
	});
}

export function useCreatePost() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: { title?: string; content: string; threadId?: string }) =>
			api.post<Post>('/api/posts', data),
		onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
	});
}

export function useToggleLike(postId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () => api.post<{ liked: boolean }>(`/api/posts/${postId}/like`),
		onSuccess: () => qc.invalidateQueries({ queryKey: ['posts', postId] }),
	});
}
