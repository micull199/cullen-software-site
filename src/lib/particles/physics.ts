import type { Particle, ParticleConfig, Vec2 } from './types';

export function applyCenterGravity(
	particle: Particle,
	centerX: number,
	centerY: number,
	config: ParticleConfig
) {
	// Pull toward rest position (distributed within blob)
	const dx = particle.restX - particle.x;
	const dy = particle.restY - particle.y;
	const dist = Math.sqrt(dx * dx + dy * dy);

	if (dist > 1) {
		// Stronger pull the further away — elastic spring
		const force = config.centerGravity * dist * 0.01;
		particle.vx += (dx / dist) * force * dist;
		particle.vy += (dy / dist) * force * dist;
	}
}

export function applyMouseRepulsion(
	particle: Particle,
	mouse: Vec2,
	config: ParticleConfig
) {
	const dx = particle.x - mouse.x;
	const dy = particle.y - mouse.y;
	const distSq = dx * dx + dy * dy;
	const dist = Math.sqrt(distSq);

	if (dist < config.mouseRepelRadius && dist > 1) {
		// Strong push away — inverse distance for liquid splash feel
		const proximity = 1 - dist / config.mouseRepelRadius;
		const force = config.mouseRepelStrength * proximity * proximity;
		particle.vx += (dx / dist) * force;
		particle.vy += (dy / dist) * force;
	}
}

export function applyMouseRepulsionContinuous(
	particle: Particle,
	mouse: Vec2,
	prevMouse: Vec2,
	config: ParticleConfig
) {
	// Also repel from mouse velocity direction for a "plowing" effect
	const mvx = mouse.x - prevMouse.x;
	const mvy = mouse.y - prevMouse.y;
	const mouseSpeed = Math.sqrt(mvx * mvx + mvy * mvy);

	if (mouseSpeed < 2) return;

	const dx = particle.x - mouse.x;
	const dy = particle.y - mouse.y;
	const dist = Math.sqrt(dx * dx + dy * dy);
	const radius = config.mouseRepelRadius * 1.2;

	if (dist < radius && dist > 1) {
		const proximity = 1 - dist / radius;
		const force = proximity * mouseSpeed * 0.15;
		particle.vx += (dx / dist) * force;
		particle.vy += (dy / dist) * force;
	}
}

export function applyWind(
	particle: Particle,
	time: number
) {
	// Subtle, slowly varying wind using layered sine waves per particle
	const t = time * 0.0001;
	const px = particle.phaseOffset;
	const windX = Math.sin(t * 1.3 + px) * 0.012 + Math.sin(t * 3.7 + px * 2.1) * 0.006;
	const windY = Math.cos(t * 1.1 + px * 0.7) * 0.008 + Math.sin(t * 2.9 + px * 1.4) * 0.004;
	particle.vx += windX;
	particle.vy += windY;
}

export function updateParticle(
	particle: Particle,
	width: number,
	height: number,
	config: ParticleConfig,
	time: number
) {
	// Apply damping — high damping for viscous liquid feel
	particle.vx *= config.damping;
	particle.vy *= config.damping;

	// Clamp velocity and cache speed for renderer
	const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
	if (speed > config.maxVelocity) {
		particle.vx = (particle.vx / speed) * config.maxVelocity;
		particle.vy = (particle.vy / speed) * config.maxVelocity;
		particle.speed = config.maxVelocity;
	} else {
		particle.speed = speed;
	}

	// Update position
	particle.x += particle.vx;
	particle.y += particle.vy;

	// Soft boundary — push back from edges
	const margin = 20;
	if (particle.x < margin) particle.vx += 0.5;
	if (particle.x > width - margin) particle.vx -= 0.5;
	if (particle.y < margin) particle.vy += 0.5;
	if (particle.y > height - margin) particle.vy -= 0.5;

	// Decay collision energy
	if (particle.collisionEnergy > 0) {
		particle.collisionEnergy *= 0.95;
		if (particle.collisionEnergy < 0.005) particle.collisionEnergy = 0;
	}

	// Breathing opacity
	if (!particle.isTrail) {
		particle.opacity =
			particle.baseOpacity *
			(0.8 + 0.2 * Math.sin(time * 0.0008 + particle.phaseOffset));
	}

	// Trail particles fade out
	if (particle.isTrail) {
		particle.life -= 0.02;
		particle.opacity = particle.baseOpacity * particle.life;
	}
}

export function createParticle(
	x: number,
	y: number,
	colors: [number, number, number][],
	isTrail = false
): Particle {
	const color = colors[Math.floor(Math.random() * colors.length)];
	// Layered depth: mostly small particles, some medium, few large
	const depthRoll = Math.random();
	let radius: number;
	let opacity: number;
	if (isTrail) {
		radius = 1.5;
		opacity = 0.2;
	} else if (depthRoll < 0.6) {
		// Small background particles — subtle, numerous
		radius = 0.8 + Math.random() * 1.2;
		opacity = 0.06 + Math.random() * 0.12;
	} else if (depthRoll < 0.9) {
		// Medium particles — the core
		radius = 1.8 + Math.random() * 1.5;
		opacity = 0.12 + Math.random() * 0.2;
	} else {
		// Large foreground particles — few, brighter, create focal points
		radius = 3 + Math.random() * 2;
		opacity = 0.2 + Math.random() * 0.15;
	}

	return {
		x,
		y,
		vx: 0,
		vy: 0,
		radius,
		color,
		opacity,
		baseOpacity: opacity,
		phaseOffset: Math.random() * Math.PI * 2,
		life: 1,
		speed: 0,
		collisionEnergy: 0,
		isTrail,
		restX: x,
		restY: y,
	};
}

export function colorFromVelocity(
	particle: Particle,
	colors: [number, number, number][]
): [number, number, number] {
	const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
	const t = Math.min(speed / 3, 1);

	// Blend from muted cyan (slow) through violet to pink (fast)
	if (t < 0.5) {
		const s = t * 2;
		return [
			colors[0][0] + (colors[1][0] - colors[0][0]) * s,
			colors[0][1] + (colors[1][1] - colors[0][1]) * s,
			colors[0][2] + (colors[1][2] - colors[0][2]) * s,
		];
	} else {
		const s = (t - 0.5) * 2;
		return [
			colors[1][0] + (colors[2][0] - colors[1][0]) * s,
			colors[1][1] + (colors[2][1] - colors[1][1]) * s,
			colors[1][2] + (colors[2][2] - colors[1][2]) * s,
		];
	}
}
