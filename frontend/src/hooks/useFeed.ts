import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Post } from './usePosts';

interface FeedResponse {
	posts: Post[];
	total: number;
	page: number;
	limit: number;
}

export function useFeed(page = 1, limit = 20) {
	return useQuery({
		queryKey: ['feed', page, limit],
		queryFn: () => api.get<FeedResponse>(`/api/feed?page=${page}&limit=${limit}`),
		staleTime: 30_000,
		retry: 1,
	});
}
