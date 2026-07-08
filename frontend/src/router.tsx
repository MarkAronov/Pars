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
import ForgotPasswordPage from './components/6-pages/ForgotPasswordPage';
import HomePage from './components/6-pages/HomePage';
import LoginPage from './components/6-pages/LoginPage';
import NotFoundPage from './components/6-pages/NotFoundPage';
import SettingsPage from './components/6-pages/SettingsPage';
import SignUpPage from './components/6-pages/SignUpPage';
import StartPage from './components/6-pages/StartPage';
import UserPage from './components/6-pages/UserPage';
import { authClient } from './lib/auth';

// beforeLoad reruns on every navigation (unlike loaders, it ignores staleTime),
// so without this cache every route change would re-hit the session endpoint.
const SESSION_CACHE_MS = 5_000;
let cachedSessionPromise: Promise<unknown> | null = null;
let cachedSessionAt = 0;

// Call after sign-in/sign-up/sign-out so the next navigation's beforeLoad
// doesn't act on a stale cached session for up to SESSION_CACHE_MS.
export const invalidateSessionCache = () => {
	cachedSessionPromise = null;
};

// Returns the session or null — never throws (network failures = logged out)
const getSession = async () => {
	const now = Date.now();
	if (!cachedSessionPromise || now - cachedSessionAt > SESSION_CACHE_MS) {
		cachedSessionAt = now;
		cachedSessionPromise = authClient
			.getSession()
			.then(({ data }) => data?.session ?? null)
			.catch(() => null);
	}
	return cachedSessionPromise;
};

// ── Root ──────────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({ component: Outlet });

// ── Public shell (no layout chrome) ───────────────────────────────────────────

const startRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/',
	beforeLoad: async () => {
		const session = await getSession();
		if (session) throw redirect({ to: '/home' });
	},
	component: StartPage,
});

const loginRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/login',
	beforeLoad: async () => {
		const session = await getSession();
		if (session) throw redirect({ to: '/home' });
	},
	component: LoginPage,
});

const signupRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/signup',
	beforeLoad: async () => {
		const session = await getSession();
		if (session) throw redirect({ to: '/home' });
	},
	component: SignUpPage,
});

const aboutRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/about',
	component: AboutPage,
});

const forgotPasswordRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/forgot-password',
	beforeLoad: async () => {
		const session = await getSession();
		if (session) throw redirect({ to: '/home' });
	},
	component: ForgotPasswordPage,
});

const notFoundRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '*',
	component: NotFoundPage,
});

// ── Authenticated layout ───────────────────────────────────────────────────────

const appLayoutRoute = createRoute({
	getParentRoute: () => rootRoute,
	id: 'app',
	beforeLoad: async () => {
		const session = await getSession();
		if (!session) throw redirect({ to: '/' });
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
	forgotPasswordRoute,
	notFoundRoute,
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
