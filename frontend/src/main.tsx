import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ThemeEngine from './components/4-organisms/ThemeEngine';
import { startFaviconAnimation } from './lib/faviconAnimation';
import './index.css';

startFaviconAnimation();

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 30_000,
			retry: 1,
		},
	},
});

const rootElement = document.getElementById('root');
if (rootElement) {
	createRoot(rootElement).render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<ThemeEngine />
				<ReactQueryDevtools initialIsOpen={false} />
			</QueryClientProvider>
		</StrictMode>,
	);
}
