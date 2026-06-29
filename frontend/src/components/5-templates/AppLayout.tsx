import { Outlet } from '@tanstack/react-router';
import { cn } from '../../lib/utils';
import { COLORS, LAYOUT } from '../1-ions';
import Header from '../3-molecules/Header';

const AppLayout = () => (
	<div
		className={cn('min-h-screen flex flex-col', COLORS.bg, COLORS.textPrimary)}
	>
		<Header />
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

export default AppLayout;
