export interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	radius: number;
	color: [number, number, number]; // RGB
	opacity: number;
	baseOpacity: number;
	phaseOffset: number; // for breathing animation
	life: number; // 0-1, 1 = full life
	speed: number; // cached current speed for renderer
	collisionEnergy: number; // 0-1, set on particle collision, decays over time
	isTrail: boolean;
	// Rest position for center gravity — where this particle "wants" to be
	restX: number;
	restY: number;
}

export interface Vec2 {
	x: number;
	y: number;
}

export interface ParticleConfig {
	maxParticles: number;
	mouseRepelRadius: number;
	mouseRepelStrength: number;
	centerGravity: number; // how strongly particles pull back to center
	cohesionRadius: number; // distance for liquid cohesion between neighbors
	cohesionStrength: number;
	separationRadius: number;
	separationStrength: number;
	connectionMaxDistance: number;
	damping: number;
	maxVelocity: number;
	blobRadius: number; // radius of the resting blob shape
	ringRadius: number; // radius of the circular border ring (computed at runtime)
	ringGravity: number; // how strongly ring particles pull toward the circumference
	ringParticleRatio: number; // fraction of particles assigned to the ring
	colors: [number, number, number][];
}

export const DEFAULT_CONFIG: ParticleConfig = {
	maxParticles: 3600,
	mouseRepelRadius: 160,
	mouseRepelStrength: 12,
	centerGravity: 0.003,
	cohesionRadius: 60,
	cohesionStrength: 0.0004,
	separationRadius: 18,
	separationStrength: 0.05,
	connectionMaxDistance: 120,
	damping: 0.82,
	maxVelocity: 2,
	blobRadius: 0, // computed at runtime from viewport
	ringRadius: 0, // computed at runtime from viewport
	ringGravity: 0.002,
	ringParticleRatio: 0.25, // 25% of particles go to the ring
	colors: [
		[40, 120, 200], // steel blue
		[60, 80, 180],  // deep blue
		[80, 140, 220], // bright blue
	],
};
