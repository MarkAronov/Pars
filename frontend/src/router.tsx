import {
	createRootRoute,
	createRoute,
	createRouter,
	Outlet,
} from '@tanstack/react-router';
import StartPage from './components/6-pages/StartPage';
import UserPage from './components/6-pages/UserPage';

const rootRoute = createRootRoute({ component: Outlet });

const startRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/',
	component: StartPage,
});

const userRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/u/$username',
	component: UserPage,
});

const routeTree = rootRoute.addChildren([startRoute, userRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}
