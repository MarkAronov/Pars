import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface Topic {
	id: string;
	name: string;
	description: string | null;
	createdAt: string;
}

export function useTopics(page = 1, limit = 50) {
	return useQuery({
		queryKey: ['topics', page, limit],
		queryFn: () => api.get<Topic[]>(`/api/topics?page=${page}&limit=${limit}`),
		staleTime: 60_000,
		retry: 1,
	});
}

export function useTopic(id: string) {
	return useQuery({
		queryKey: ['topics', id],
		queryFn: () => api.get<Topic>(`/api/topics/${id}`),
		staleTime: 60_000,
		retry: 1,
	});
}
