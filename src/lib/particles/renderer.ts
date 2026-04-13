import type { Particle, ParticleConfig } from './types';
import type { SpatialGrid } from './spatial-grid';

// Pre-rendered blue-tinted glow sprite
let glowSprite: HTMLCanvasElement | null = null;
const GLOW_SIZE = 64;

function getGlowSprite(): HTMLCanvasElement {
	if (glowSprite) return glowSprite;
	glowSprite = document.createElement('canvas');
	glowSprite.width = GLOW_SIZE;
	glowSprite.height = GLOW_SIZE;
	const ctx = glowSprite.getContext('2d')!;
	const half = GLOW_SIZE / 2;
	const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
	gradient.addColorStop(0, 'rgba(100,160,255,0.25)');
	gradient.addColorStop(0.3, 'rgba(80,140,240,0.08)');
	gradient.addColorStop(0.6, 'rgba(60,120,220,0.02)');
	gradient.addColorStop(1, 'rgba(60,120,220,0)');
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, GLOW_SIZE, GLOW_SIZE);
	return glowSprite;
}

export function renderParticles(
	ctx: CanvasRenderingContext2D,
	particles: Particle[],
	_config: ParticleConfig
) {
	const sprite = getGlowSprite();

	// Pass 1: All particles as filled circles
	ctx.globalCompositeOperation = 'source-over';

	for (let i = 0; i < particles.length; i++) {
		const p = particles[i];
		if (p.opacity <= 0.01) continue;

		const ce = p.collisionEnergy;

		// Color: base blue, shifts toward bright electric blue-white on collision
		let r: number, g: number, b: number;
		if (ce > 0.01) {
			const t = ce * ce; // exponential — subtle at low energy, visible at high
			r = (p.color[0] + (140 - p.color[0]) * t) | 0;
			g = (p.color[1] + (190 - p.color[1]) * t) | 0;
			b = (p.color[2] + (255 - p.color[2]) * t) | 0;
		} else {
			r = p.color[0];
			g = p.color[1];
			b = p.color[2];
		}

		// Subtle opacity lift on collision — not a flash, just a gentle brightening
		const alpha = p.opacity + ce * 0.12;

		ctx.globalAlpha = Math.min(alpha, 0.65);
		ctx.fillStyle = `rgb(${r},${g},${b})`;
		ctx.beginPath();
		ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
		ctx.fill();
	}

	// Pass 2: Glow halos — only on particles with collision energy
	ctx.globalCompositeOperation = 'lighter';

	for (let i = 0; i < particles.length; i++) {
		const p = particles[i];
		const ce = p.collisionEnergy;

		// Only glow on collision, and only above a threshold
		if (ce < 0.15) continue;

		const intensity = ce * ce;
		const glowSize = p.radius * 6 + intensity * 8;
		const glowAlpha = intensity * 0.25;

		ctx.globalAlpha = Math.min(glowAlpha, 0.3);
		ctx.drawImage(sprite, p.x - glowSize / 2, p.y - glowSize / 2, glowSize, glowSize);
	}

	ctx.globalAlpha = 1;
	ctx.globalCompositeOperation = 'source-over';
}

// Connection rendering removed — kept export for compatibility
export function renderConnections(
	_ctx: CanvasRenderingContext2D,
	_grid: SpatialGrid,
	_config: ParticleConfig
) {}
