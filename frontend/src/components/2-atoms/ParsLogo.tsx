import { useEffect, useState } from 'react';

type LogoState = 'normal' | 'surprised' | 'dead' | 'loading';

interface ParsLogoProps {
	size?: number;
	notificationCount?: number;
	isLoading?: boolean;
}

interface ConfettiPiece {
	id: number;
	x: number;
	y: number;
	color: string;
	shape: 'rect' | 'circle' | 'diamond';
	rot: number;
	dur: number;
	delay: number;
}

const CONFETTI: ConfettiPiece[] = [
	{
		id: 0,
		x: 0,
		y: 13,
		color: '#FF6B6B',
		shape: 'rect',
		rot: 20,
		dur: 2.1,
		delay: 0.0,
	},
	{
		id: 1,
		x: -1,
		y: 40,
		color: '#4ECDC4',
		shape: 'circle',
		rot: 0,
		dur: 2.8,
		delay: 0.5,
	},
	{
		id: 2,
		x: -1,
		y: 63,
		color: '#FFE66D',
		shape: 'diamond',
		rot: 15,
		dur: 2.4,
		delay: 1.1,
	},
	{
		id: 3,
		x: 70,
		y: 10,
		color: '#FF9F43',
		shape: 'rect',
		rot: -25,
		dur: 2.6,
		delay: 0.3,
	},
	{
		id: 4,
		x: 71,
		y: 30,
		color: '#6C5CE7',
		shape: 'circle',
		rot: 0,
		dur: 2.2,
		delay: 0.8,
	},
	{
		id: 5,
		x: 68,
		y: 53,
		color: '#96CEB4',
		shape: 'rect',
		rot: 40,
		dur: 3.0,
		delay: 0.2,
	},
	{
		id: 6,
		x: 68,
		y: 73,
		color: '#FF6B6B',
		shape: 'diamond',
		rot: -10,
		dur: 2.7,
		delay: 1.3,
	},
	{
		id: 7,
		x: 25,
		y: 83,
		color: '#FFE66D',
		shape: 'circle',
		rot: 0,
		dur: 2.3,
		delay: 0.6,
	},
	{
		id: 8,
		x: 50,
		y: 85,
		color: '#4ECDC4',
		shape: 'rect',
		rot: 30,
		dur: 2.5,
		delay: 1.0,
	},
	{
		id: 9,
		x: 45,
		y: 8,
		color: '#FF8C94',
		shape: 'circle',
		rot: 0,
		dur: 2.0,
		delay: 0.4,
	},
	{
		id: 10,
		x: 22,
		y: 8,
		color: '#6C5CE7',
		shape: 'rect',
		rot: -25,
		dur: 2.9,
		delay: 0.7,
	},
	{
		id: 11,
		x: 15,
		y: 14,
		color: '#FFE66D',
		shape: 'rect',
		rot: 15,
		dur: 2.5,
		delay: 1.0,
	},
	{
		id: 12,
		x: -1,
		y: 65,
		color: '#96CEB4',
		shape: 'diamond',
		rot: 0,
		dur: 2.9,
		delay: 0.2,
	},
	{
		id: 13,
		x: 60,
		y: 84,
		color: '#A78BFA',
		shape: 'circle',
		rot: 0,
		dur: 2.4,
		delay: 0.9,
	},
	{
		id: 14,
		x: 42,
		y: 14,
		color: '#FF6B6B',
		shape: 'circle',
		rot: 0,
		dur: 1.9,
		delay: 1.2,
	},
];

// Single unified P path — traces the full silhouette with rounded corners.
// The Z close draws the left edge automatically.
const P_PATH =
	'M 10,16 Q 10,8 18,8 ' +
	'L 25,8 ' +
	'C 55,8 76,20 76,32 ' +
	'C 76,44 55,58 25,58 ' +
	'L 25,82 ' +
	'Q 25,88 19,88 ' +
	'L 17,88 ' +
	'Q 10,88 10,82 ' +
	'Z';

// Spinner arc: ~75% of circumference of r=8 circle (2π·8 ≈ 50.3 → dash 38, gap 13)
const SPINNER_DASH = '38 13';

const ParsLogo = ({
	size = 48,
	notificationCount = 0,
	isLoading = false,
}: ParsLogoProps) => {
	const [isOnline, setIsOnline] = useState(
		typeof window !== 'undefined' ? navigator.onLine : true,
	);

	useEffect(() => {
		const onOnline = () => setIsOnline(true);
		const onOffline = () => setIsOnline(false);
		window.addEventListener('online', onOnline);
		window.addEventListener('offline', onOffline);
		return () => {
			window.removeEventListener('online', onOnline);
			window.removeEventListener('offline', onOffline);
		};
	}, []);

	// Priority: dead > loading > surprised > normal
	const state: LogoState = !isOnline
		? 'dead'
		: isLoading
			? 'loading'
			: notificationCount > 0
				? 'surprised'
				: 'normal';

	const pFill = state === 'dead' ? '#9CA3AF' : '#FFFFFF';
	const faceFill = state === 'dead' ? '#FFFFFF' : '#7C3AED';

	const floatStyle = (c: ConfettiPiece): React.CSSProperties => ({
		animationName: 'parsLogoFloat',
		animationDuration: `${c.dur}s`,
		animationDelay: `${c.delay}s`,
		animationTimingFunction: 'ease-in-out',
		animationIterationCount: 'infinite',
		animationDirection: 'alternate',
		transformBox: 'fill-box' as React.CSSProperties['transformBox'],
		transformOrigin: 'center',
	});

	const spinStyle: React.CSSProperties = {
		animationName: 'parsLogoSpin',
		animationDuration: '0.9s',
		animationTimingFunction: 'linear',
		animationIterationCount: 'infinite',
		transformBox: 'fill-box' as React.CSSProperties['transformBox'],
		transformOrigin: 'center',
	};

	const renderPiece = (c: ConfettiPiece) => {
		const cx = c.x + 3.5;
		const cy = c.y + 3.5;
		return (
			<g key={c.id} style={floatStyle(c)}>
				<g transform={`rotate(${c.rot}, ${cx}, ${cy})`}>
					{c.shape === 'rect' && (
						<rect
							x={c.x}
							y={c.y}
							width="7"
							height="4.5"
							rx="1"
							fill={c.color}
						/>
					)}
					{c.shape === 'circle' && (
						<circle cx={cx} cy={cy} r="3.5" fill={c.color} />
					)}
					{c.shape === 'diamond' && (
						<polygon
							points={`${cx},${c.y} ${c.x + 7},${cy} ${cx},${c.y + 7} ${c.x},${cy}`}
							fill={c.color}
						/>
					)}
				</g>
			</g>
		);
	};

	return (
		<svg
			viewBox="-4 4 86 88"
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			overflow="visible"
			aria-label="Pars"
			role="img"
		>
			<defs>
				<style>{`
					@keyframes parsLogoFloat {
						from { transform: translateY(0px); }
						to   { transform: translateY(-9px); }
					}
					@keyframes parsLogoSpin {
						from { transform: rotate(0deg); }
						to   { transform: rotate(360deg); }
					}
				`}</style>
			</defs>

			{state !== 'dead' && CONFETTI.map(renderPiece)}

			<g transform="skewX(-8) translate(3,0)">
				<path d={P_PATH} fill={pFill} />

				{state === 'normal' && (
					<>
						<circle cx="40" cy="26" r="4" fill={faceFill} />
						<circle cx="57" cy="26" r="4" fill={faceFill} />
						<path
							d="M 37,41 Q 48.5,51 60,41"
							stroke={faceFill}
							strokeWidth="3.5"
							fill="none"
							strokeLinecap="round"
						/>
					</>
				)}

				{state === 'loading' && (
					<>
						<circle cx="40" cy="26" r="4" fill={faceFill} />
						<circle cx="57" cy="26" r="4" fill={faceFill} />
						{/* Spinner arc rotates around its own center */}
						<g style={spinStyle}>
							<circle
								cx="48.5"
								cy="43"
								r="8"
								fill="none"
								stroke={faceFill}
								strokeWidth="3.5"
								strokeDasharray={SPINNER_DASH}
								strokeLinecap="round"
							/>
						</g>
					</>
				)}

				{state === 'surprised' && (
					<>
						<circle cx="40" cy="25" r="5.5" fill={faceFill} />
						<circle cx="57" cy="25" r="5.5" fill={faceFill} />
						<circle cx="40" cy="26" r="2.5" fill={pFill} />
						<circle cx="57" cy="26" r="2.5" fill={pFill} />
						<ellipse cx="48.5" cy="43" rx="6" ry="8" fill={faceFill} />
					</>
				)}

				{state === 'dead' && (
					<>
						<line
							x1="35"
							y1="20"
							x2="44"
							y2="29"
							stroke={faceFill}
							strokeWidth="3.5"
							strokeLinecap="round"
						/>
						<line
							x1="44"
							y1="20"
							x2="35"
							y2="29"
							stroke={faceFill}
							strokeWidth="3.5"
							strokeLinecap="round"
						/>
						<line
							x1="52"
							y1="20"
							x2="61"
							y2="29"
							stroke={faceFill}
							strokeWidth="3.5"
							strokeLinecap="round"
						/>
						<line
							x1="61"
							y1="20"
							x2="52"
							y2="29"
							stroke={faceFill}
							strokeWidth="3.5"
							strokeLinecap="round"
						/>
						<path
							d="M 37,47 Q 48.5,39 60,47"
							stroke={faceFill}
							strokeWidth="3.5"
							fill="none"
							strokeLinecap="round"
						/>
					</>
				)}
			</g>

			{notificationCount > 0 && state !== 'dead' && (
				<>
					<circle cx="88" cy="12" r="13" fill="#EF4444" />
					<text
						x="88"
						y="17"
						textAnchor="middle"
						dominantBaseline="middle"
						fill="white"
						fontSize="12"
						fontWeight="bold"
						fontFamily="system-ui, -apple-system, sans-serif"
					>
						{notificationCount > 99 ? '99+' : String(notificationCount)}
					</text>
				</>
			)}
		</svg>
	);
};

export default ParsLogo;
