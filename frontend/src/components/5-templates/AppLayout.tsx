import { Outlet } from '@tanstack/react-router';
import Header from '../3-molecules/Header';

const AppLayout = () => (
	<div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
		<Header />
		<main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6">
			<Outlet />
		</main>
	</div>
);

export default AppLayout;
