// Canvas-based animated favicon — works in all browsers (SVG favicons don't animate in Chrome).
// Mirrors the ParsLogo SVG: same viewBox, same P path, same confetti positions.

const SIZE = 64;

// viewBox: -4 4 86 88  →  canvas 64×64
const SCALE = SIZE / 88;
const VB_OX = 4; // negate viewBox minX
const VB_OY = -4; // negate viewBox minY

// P shape — same path string as ParsLogo.tsx
const P_PATH = new Path2D(
	'M 10,16 Q 10,8 18,8 L 25,8 C 55,8 76,20 76,32 C 76,44 55,58 25,58 L 25,82 Q 25,88 19,88 L 17,88 Q 10,88 10,82 Z',
);

// Subset of confetti — circles only (simplest to draw on canvas at 64px)
const CONFETTI = [
	{ x: 5, y: 17.25, color: '#FF6B6B', dur: 2.1, delay: 0.0 },
	{ x: 3, y: 43.5, color: '#4ECDC4', dur: 2.8, delay: 0.5 },
	{ x: 74, y: 16.25, color: '#FF9F43', dur: 2.6, delay: 0.3 },
	{ x: 75, y: 35.5, color: '#6C5CE7', dur: 2.2, delay: 0.8 },
	{ x: 75, y: 79.5, color: '#96CEB4', dur: 3.0, delay: 0.2 },
	{ x: 31.5, y: 86, color: '#FFE66D', dur: 2.3, delay: 0.6 },
	{ x: 63, y: 17, color: '#FF8C94', dur: 2.0, delay: 0.4 },
	{ x: 18.5, y: 16.25, color: '#FFE66D', dur: 2.5, delay: 1.0 },
	{ x: 2, y: 68, color: '#96CEB4', dur: 2.9, delay: 0.2 },
	{ x: 63, y: 87, color: '#A78BFA', dur: 2.4, delay: 0.9 },
	{ x: 45, y: 17, color: '#FF6B6B', dur: 1.9, delay: 1.2 },
];

function draw(ctx: CanvasRenderingContext2D, t: number) {
	ctx.clearRect(0, 0, SIZE, SIZE);

	// Dark background — matches app's bg-neutral-950
	ctx.fillStyle = '#09090b';
	ctx.fillRect(0, 0, SIZE, SIZE);

	ctx.save();
	// Map SVG viewBox coordinates → canvas pixels
	ctx.scale(SCALE, SCALE);
	ctx.translate(VB_OX, VB_OY);

	// Confetti — sinusoidal float
	for (const c of CONFETTI) {
		const float =
			Math.sin((t / c.dur) * Math.PI * 2 + c.delay * Math.PI * 2) * 4.5;
		ctx.fillStyle = c.color;
		ctx.beginPath();
		ctx.arc(c.x, c.y + float, 3.5, 0, Math.PI * 2);
		ctx.fill();
	}

	// P — skewX(-8°) then translate(3,0)
	// skewX matrix: transform(1, 0, tan(-8°), 1, 0, 0) combined with tx=3
	ctx.save();
	ctx.transform(1, 0, -0.1405, 1, 3, 0);

	ctx.fillStyle = '#ffffff';
	ctx.fill(P_PATH);

	// Eyes (violet dots)
	ctx.fillStyle = '#7C3AED';
	ctx.beginPath();
	ctx.arc(40, 26, 4, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(57, 26, 4, 0, Math.PI * 2);
	ctx.fill();

	// Smile
	ctx.strokeStyle = '#7C3AED';
	ctx.lineWidth = 3.5;
	ctx.lineCap = 'round';
	ctx.beginPath();
	ctx.moveTo(37, 41);
	ctx.quadraticCurveTo(48.5, 51, 60, 41);
	ctx.stroke();

	ctx.restore();
	ctx.restore();
}

export function startFaviconAnimation(): () => void {
	const canvas = document.createElement('canvas');
	canvas.width = SIZE;
	canvas.height = SIZE;
	const ctx = canvas.getContext('2d');
	if (!ctx) return () => {};

	const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
	if (!link) return () => {};

	let raf = 0;
	let lastUpdate = 0;

	function loop(timestamp: number) {
		raf = requestAnimationFrame(loop);
		if (timestamp - lastUpdate < 50) return; // ~20 fps
		lastUpdate = timestamp;
		if (ctx && link) {
			draw(ctx, timestamp / 1000);
			link.href = canvas.toDataURL('image/png');
		}
	}

	raf = requestAnimationFrame(loop);
	return () => cancelAnimationFrame(raf);
}
