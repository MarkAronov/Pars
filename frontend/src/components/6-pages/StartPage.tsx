import { Link } from '@tanstack/react-router';
import Footer from '../3-molecules/Footer';

const StartPage = () => (
	<div className="min-h-screen bg-neutral-950 flex flex-col">
		<div className="flex-1 flex flex-col items-center justify-center px-4 gap-8">
			<div className="text-center">
				<h1 className="text-5xl font-bold tracking-tight text-white mb-3">
					Pars
				</h1>
				<p className="text-neutral-400 text-lg">
					A place to share ideas and connect.
				</p>
			</div>

			<div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
				<Link
					to="/signup"
					className="flex-1 text-center rounded-md bg-white text-neutral-950 px-5 py-2.5 text-sm font-medium hover:bg-neutral-200 transition-colors"
				>
					Get started
				</Link>
				<Link
					to="/login"
					className="flex-1 text-center rounded-md border border-neutral-700 text-neutral-200 px-5 py-2.5 text-sm font-medium hover:border-neutral-500 hover:text-white transition-colors"
				>
					Sign in
				</Link>
			</div>

			<Link
				to="/about"
				className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
			>
				About Pars
			</Link>
		</div>

		<Footer />
	</div>
);

export default StartPage;
