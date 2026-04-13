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
	const t = time * 0.0006;
	const px = particle.phaseOffset;

	// Intense swirling wind
	const windAngle = t * 0.8 + Math.sin(t * 0.3) * 1.5;
	const baseStrength = 3.5;
	const swirl = baseStrength + Math.sin(t * 1.7 + px) * 1.2;

	const windX = Math.cos(windAngle) * swirl;
	const windY = Math.sin(windAngle) * swirl;

	// Strong per-particle turbulence
	const turbX = Math.sin(t * 3.1 + px * 2.3) * 1.0;
	const turbY = Math.cos(t * 2.7 + px * 1.8) * 1.0;

	particle.vx += windX + turbX;
	particle.vy += windY + turbY;
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

	// Ring boundary — elastic bounce
	if (config.ringRadius > 0) {
		const centerX = width / 2;
		const centerY = height / 2;
		const dx = particle.x - centerX;
		const dy = particle.y - centerY;
		const distFromCenter = Math.sqrt(dx * dx + dy * dy);
		const ringR = config.ringRadius;
		const softZone = config.ringSoftness;

		if (distFromCenter > ringR - softZone) {
			const nx = dx / distFromCenter; // normal pointing outward
			const ny = dy / distFromCenter;

			if (distFromCenter >= ringR) {
				// Past the boundary — reflect velocity inward and push back
				const dot = particle.vx * nx + particle.vy * ny;
				if (dot > 0) {
					// Only reflect outward-moving component
					particle.vx -= 2 * dot * nx * config.ringBounce;
					particle.vy -= 2 * dot * ny * config.ringBounce;
				}
				// Push particle back inside
				const overshoot = distFromCenter - ringR;
				particle.x -= nx * overshoot;
				particle.y -= ny * overshoot;
			} else {
				// In the soft zone — gentle inward push that increases toward the edge
				const penetration = (distFromCenter - (ringR - softZone)) / softZone;
				const pushForce = penetration * penetration * 0.5;
				particle.vx -= nx * pushForce;
				particle.vy -= ny * pushForce;
			}
		}
	}

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
