import {
	createRootRoute,
	createRoute,
	createRouter,
	Outlet,
	redirect,
} from '@tanstack/react-router';
import AppLayout from './components/5-templates/AppLayout';
import AboutPage from './components/6-pages/AboutPage';
import ExplorePage from './components/6-pages/ExplorePage';
import HomePage from './components/6-pages/HomePage';
import LoginPage from './components/6-pages/LoginPage';
import SettingsPage from './components/6-pages/SettingsPage';
import SignUpPage from './components/6-pages/SignUpPage';
import StartPage from './components/6-pages/StartPage';
import UserPage from './components/6-pages/UserPage';
import { authClient } from './lib/auth';

// ── Root ──────────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({ component: Outlet });

// ── Public shell (no layout chrome) ───────────────────────────────────────────

const startRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/',
	beforeLoad: async () => {
		const { data } = await authClient.getSession();
		if (data?.session) throw redirect({ to: '/home' });
	},
	component: StartPage,
});

const loginRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/login',
	beforeLoad: async () => {
		const { data } = await authClient.getSession();
		if (data?.session) throw redirect({ to: '/home' });
	},
	component: LoginPage,
});

const signupRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/signup',
	beforeLoad: async () => {
		const { data } = await authClient.getSession();
		if (data?.session) throw redirect({ to: '/home' });
	},
	component: SignUpPage,
});

const aboutRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/about',
	component: AboutPage,
});

// ── Authenticated layout ───────────────────────────────────────────────────────

const appLayoutRoute = createRoute({
	getParentRoute: () => rootRoute,
	id: 'app',
	beforeLoad: async () => {
		const { data } = await authClient.getSession();
		if (!data?.session) throw redirect({ to: '/' });
	},
	component: AppLayout,
});

const homeRoute = createRoute({
	getParentRoute: () => appLayoutRoute,
	path: '/home',
	component: HomePage,
});

const exploreRoute = createRoute({
	getParentRoute: () => appLayoutRoute,
	path: '/explore',
	component: ExplorePage,
});

const settingsRoute = createRoute({
	getParentRoute: () => appLayoutRoute,
	path: '/settings',
	component: SettingsPage,
});

const userRoute = createRoute({
	getParentRoute: () => appLayoutRoute,
	path: '/u/$username',
	component: UserPage,
});

// ── Tree ──────────────────────────────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
	startRoute,
	loginRoute,
	signupRoute,
	aboutRoute,
	appLayoutRoute.addChildren([
		homeRoute,
		exploreRoute,
		settingsRoute,
		userRoute,
	]),
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}
