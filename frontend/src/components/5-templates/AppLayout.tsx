import { Outlet } from '@tanstack/react-router';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { COLORS, LAYOUT } from '../1-ions';
import Drawer from '../2-atoms/Drawer';
import Header from '../3-molecules/Header';

const AppLayout = () => {
	const [drawerOpen, setDrawerOpen] = useState(false);

	return (
		<div
			className={cn(
				'min-h-screen flex flex-col',
				COLORS.bg,
				COLORS.textPrimary,
			)}
		>
			<Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
			<Header onMenuOpen={() => setDrawerOpen(true)} />
			<main
				className={cn(
					'flex-1 w-full mx-auto',
					LAYOUT.CONTENT_MEDIUM,
					LAYOUT.PAGE_PADDING,
					LAYOUT.PAGE_Y,
				)}
			>
				<Outlet />
			</main>
		</div>
	);
};

export default AppLayout;
