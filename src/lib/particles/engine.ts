import type { Particle, ParticleConfig, Vec2 } from './types';
import { DEFAULT_CONFIG } from './types';
import {
	applyCenterGravity,
	applyMouseRepulsion,
	applyMouseRepulsionContinuous,
	applyWind,
	updateParticle,
	createParticle,
} from './physics';
import { renderParticles } from './renderer';
import { SpatialGrid } from './spatial-grid';

export class ParticleEngine {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private particles: Particle[] = [];
	private config: ParticleConfig;
	private grid: SpatialGrid;
	private mouse: Vec2 = { x: -1000, y: -1000 };
	private prevMouse: Vec2 = { x: -1000, y: -1000 };
	private animationId = 0;
	private lastTime = 0;
	private frameCount = 0;
	private fpsAccum = 0;
	private currentFps = 60;
	private width = 0;
	private height = 0;
	private dpr = 1;
	private centerX = 0;
	private centerY = 0;
	private prefersReducedMotion = false;
	private _mouseEnabled = true;
	private gravityCenterX = 0;
	private gravityCenterY = 0;
	private gravityCenterVX = 0;
	private gravityCenterVY = 0;

	constructor(canvas: HTMLCanvasElement, config?: Partial<ParticleConfig>) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d', { alpha: true })!;
		this.config = { ...DEFAULT_CONFIG, ...config };
		this.prefersReducedMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)'
		).matches;

		// Adapt particle count for mobile
		if (window.innerWidth < 768) {
			this.config.maxParticles = Math.min(this.config.maxParticles, 1800);
		}

		this.dpr = 1;
		this.resize();
		this.gravityCenterX = this.centerX;
		this.gravityCenterY = this.centerY;
		this.grid = new SpatialGrid(
			this.width,
			this.height,
			this.config.connectionMaxDistance
		);
		this.initParticles();
		this.bindEvents();
	}

	private resize() {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.centerX = this.width / 2;
		this.centerY = this.height / 2;
		this.canvas.width = this.width * this.dpr;
		this.canvas.height = this.height * this.dpr;
		this.canvas.style.width = `${this.width}px`;
		this.canvas.style.height = `${this.height}px`;
		this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
		this.grid?.resize(this.width, this.height);

		// Blob radius scales with viewport
		this.config.blobRadius = Math.min(this.width, this.height) * 0.3;
		// Ring radius — circular bounce boundary
		this.config.ringRadius = Math.min(this.width, this.height) * 0.40;
	}

	set mouseEnabled(enabled: boolean) {
		this._mouseEnabled = enabled;
		if (!enabled) {
			this.mouse.x = -1000;
			this.mouse.y = -1000;
		}
	}

	private initParticles() {
		this.particles = [];
		const blobR = this.config.blobRadius;

		// All particles start within the center blob, well inside the ring boundary
		for (let i = 0; i < this.config.maxParticles; i++) {
			const angle = Math.random() * Math.PI * 2;
			const r = blobR * Math.sqrt(Math.random()) * (0.6 + Math.random() * 0.4);
			const x = this.centerX + Math.cos(angle) * r * 1.3;
			const y = this.centerY + Math.sin(angle) * r * 0.8;

			const p = createParticle(x, y, this.config.colors);
			p.restX = x;
			p.restY = y;
			this.particles.push(p);
		}
	}

	private bindEvents() {
		const onResize = () => {
			const oldCx = this.centerX;
			const oldCy = this.centerY;
			this.resize();
			// Shift rest positions with resize
			const dx = this.centerX - oldCx;
			const dy = this.centerY - oldCy;
			for (const p of this.particles) {
				p.restX += dx;
				p.restY += dy;
			}
		};

		const onMouseMove = (e: MouseEvent) => {
			this.prevMouse.x = this.mouse.x;
			this.prevMouse.y = this.mouse.y;
			this.mouse.x = e.clientX;
			this.mouse.y = e.clientY;
		};

		const onTouchMove = (e: TouchEvent) => {
			if (e.touches.length > 0) {
				this.prevMouse.x = this.mouse.x;
				this.prevMouse.y = this.mouse.y;
				this.mouse.x = e.touches[0].clientX;
				this.mouse.y = e.touches[0].clientY;
			}
		};

		const onTouchStart = (e: TouchEvent) => {
			if (e.touches.length > 0) {
				this.mouse.x = e.touches[0].clientX;
				this.mouse.y = e.touches[0].clientY;
				this.prevMouse.x = this.mouse.x;
				this.prevMouse.y = this.mouse.y;
			}
		};

		const onTouchEnd = () => {
			this.mouse.x = -1000;
			this.mouse.y = -1000;
		};

		const onMouseLeave = () => {
			this.mouse.x = -1000;
			this.mouse.y = -1000;
		};

		window.addEventListener('resize', onResize);
		this.canvas.addEventListener('mousemove', onMouseMove);
		this.canvas.addEventListener('mouseleave', onMouseLeave);
		this.canvas.addEventListener('touchmove', onTouchMove, { passive: true });
		this.canvas.addEventListener('touchstart', onTouchStart, { passive: true });
		this.canvas.addEventListener('touchend', onTouchEnd);

		this._cleanup = () => {
			window.removeEventListener('resize', onResize);
			this.canvas.removeEventListener('mousemove', onMouseMove);
			this.canvas.removeEventListener('mouseleave', onMouseLeave);
			this.canvas.removeEventListener('touchmove', onTouchMove);
			this.canvas.removeEventListener('touchstart', onTouchStart);
			this.canvas.removeEventListener('touchend', onTouchEnd);
		};
	}

	private _cleanup: (() => void) | null = null;

	start() {
		if (this.prefersReducedMotion) return;
		this.lastTime = performance.now();
		this.loop(this.lastTime);
	}

	stop() {
		cancelAnimationFrame(this.animationId);
		this._cleanup?.();
	}

	private loop = (time: number) => {
		this.animationId = requestAnimationFrame(this.loop);

		// FPS tracking
		const delta = time - this.lastTime;
		this.lastTime = time;
		this.fpsAccum += delta;
		this.frameCount++;

		if (this.fpsAccum > 1000) {
			this.currentFps = this.frameCount / (this.fpsAccum / 1000);
			this.frameCount = 0;
			this.fpsAccum = 0;

			// Adaptive quality — only cull under severe performance issues
			if (this.currentFps < 20 && this.particles.length > 800) {
				this.particles.splice(-20);
			}
		}

		this.update(time);
		this.render();
	};

	private update(time: number) {
		// Gravity center has its own physics — autonomous movement, mouse influence, ring bounce
		const pullStrength = 0.005; // stronger mouse pull
		const returnStrength = 0.0003; // very gentle return to center
		const gcDamping = 0.98; // less damping = more speed retained
		const driftStrength = 0.15; // autonomous random drift force
		const ringR = this.config.ringRadius;
		const gcBounceLimit = ringR * 0.7;

		// Autonomous drift — slowly varying random direction
		const t = time * 0.0003;
		const driftX = Math.sin(t * 1.7 + 3.1) * driftStrength + Math.sin(t * 0.7) * driftStrength * 0.5;
		const driftY = Math.cos(t * 1.3 + 1.7) * driftStrength + Math.cos(t * 0.9) * driftStrength * 0.5;
		this.gravityCenterVX += driftX;
		this.gravityCenterVY += driftY;

		if (this._mouseEnabled && this.mouse.x > 0) {
			// Pull toward mouse
			const dx = this.mouse.x - this.gravityCenterX;
			const dy = this.mouse.y - this.gravityCenterY;
			this.gravityCenterVX += dx * pullStrength;
			this.gravityCenterVY += dy * pullStrength;
		}

		// Gentle pull back toward true center
		const returnDX = this.centerX - this.gravityCenterX;
		const returnDY = this.centerY - this.gravityCenterY;
		this.gravityCenterVX += returnDX * returnStrength;
		this.gravityCenterVY += returnDY * returnStrength;

		// Apply damping
		this.gravityCenterVX *= gcDamping;
		this.gravityCenterVY *= gcDamping;

		// Update position
		this.gravityCenterX += this.gravityCenterVX;
		this.gravityCenterY += this.gravityCenterVY;

		// Bounce off ring boundary — add random deflection for unpredictable movement
		const gcDX = this.gravityCenterX - this.centerX;
		const gcDY = this.gravityCenterY - this.centerY;
		const gcDist = Math.sqrt(gcDX * gcDX + gcDY * gcDY);
		if (gcDist > gcBounceLimit) {
			const nx = gcDX / gcDist;
			const ny = gcDY / gcDist;
			// Reflect outward velocity
			const dot = this.gravityCenterVX * nx + this.gravityCenterVY * ny;
			if (dot > 0) {
				this.gravityCenterVX -= 2 * dot * nx * 0.6;
				this.gravityCenterVY -= 2 * dot * ny * 0.6;
			}
			// Add random tangential kick on bounce for unpredictable direction
			const tangentX = -ny;
			const tangentY = nx;
			const kick = (Math.random() - 0.5) * 2.5;
			this.gravityCenterVX += tangentX * kick;
			this.gravityCenterVY += tangentY * kick;

			// Push back inside
			this.gravityCenterX = this.centerX + nx * gcBounceLimit;
			this.gravityCenterY = this.centerY + ny * gcBounceLimit;
		}

		// Build spatial grid
		this.grid.clear();

		for (let i = this.particles.length - 1; i >= 0; i--) {
			const p = this.particles[i];

			// Remove dead trail particles
			if (p.isTrail && p.life <= 0) {
				this.particles.splice(i, 1);
				continue;
			}

			// Center gravity — pulls toward the drifting gravity center
			applyCenterGravity(p, this.gravityCenterX, this.gravityCenterY, this.config);

			// Subtle wind drift
			applyWind(p, time);

			// Mouse repulsion — only when enabled (disabled on page overlays)
			if (this._mouseEnabled && this.mouse.x > 0) {
				applyMouseRepulsion(p, this.mouse, this.config);
				applyMouseRepulsionContinuous(
					p,
					this.mouse,
					this.prevMouse,
					this.config
				);
			}

			updateParticle(p, this.width, this.height, this.config, time);
			this.grid.insert(p);
		}

		// Collision detection — check nearby particles for overlap
		this.detectCollisions();
	}

	private detectCollisions() {
		const collisionDist = 8; // particles within this distance count as colliding
		for (const [a, b, dist] of this.grid.neighborPairs(collisionDist)) {
			if (a.isTrail || b.isTrail) continue;
			// Both particles get collision energy proportional to their combined speed
			const impact = Math.min((a.speed + b.speed) * 0.4, 1);
			if (impact > a.collisionEnergy) a.collisionEnergy = impact;
			if (impact > b.collisionEnergy) b.collisionEnergy = impact;
		}
	}

	private render() {
		this.ctx.fillStyle = '#0a0a0f';
		this.ctx.fillRect(0, 0, this.width, this.height);

		renderParticles(this.ctx, this.particles, this.config);
	}
}
