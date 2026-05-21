import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface Thread {
	id: string;
	title: string;
	createdAt: string;
	topic: { id: string; name: string };
	originalPoster: { id: string; username: string | null; displayName: string | null; avatarUrl: string | null };
	_count: { posts: number };
}

export function useThreads(page = 1, limit = 20, topicId?: string) {
	const params = new URLSearchParams({ page: String(page), limit: String(limit) });
	if (topicId) params.set('topicId', topicId);
	return useQuery({
		queryKey: ['threads', page, limit, topicId],
		queryFn: () => api.get<Thread[]>(`/api/threads?${params}`),
		staleTime: 30_000,
		retry: 1,
	});
}

export function useThread(id: string) {
	return useQuery({
		queryKey: ['threads', id],
		queryFn: () => api.get<Thread>(`/api/threads/${id}`),
		staleTime: 30_000,
		retry: 1,
	});
}
