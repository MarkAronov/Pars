import { Link } from '@tanstack/react-router';

const AboutPage = () => (
	<div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center px-4 gap-6 text-center">
		<h1 className="text-3xl font-bold text-white">About Pars</h1>
		<p className="text-neutral-400 max-w-md">
			Pars is an open social platform for sharing ideas, following people you
			care about, and discovering conversations that matter.
		</p>
		<Link
			to="/"
			className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
		>
			← Back
		</Link>
	</div>
);

export default AboutPage;
