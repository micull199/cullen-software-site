## Project Configuration

- **Language**: TypeScript
- **Package Manager**: npm
- **Add-ons**: none

---

# Cullen Software - Website Build Plan

## Project Overview

A minimalist, immersive single-page website for **Cullen Software** — a custom software solutions company. The site centers on a bold "Cullen Software" heading surrounded by interactive, physics-driven particle effects. Inspired by [auros.global](https://www.auros.global), but with our own creative direction: darker, more tactile, and deeply interactive.

## Tech Stack

- **SvelteKit 5** (Svelte 5 runes, `$state`, `$derived`, `$effect`)
- **TypeScript**
- **Canvas API / WebGL** for particle rendering (vanilla — no Three.js unless needed)
- **Tailwind CSS v4** for layout and typography
- **Vite** (bundled with SvelteKit)

## Design Direction

### Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Background | Near-black | `#0a0a0f` |
| Particles (primary) | Soft cyan | `#7dfff5` |
| Particles (secondary) | Muted violet | `#c084fc` |
| Particles (accent) | Warm pink | `#f0abfc` |
| Heading text | White | `#f0f0f5` |
| Subtext | Muted gray | `#6b7280` |
| Glow / bloom | Cyan-tinted | `rgba(125, 255, 245, 0.15)` |

### Typography

- **Heading**: Large, bold, wide-tracked sans-serif (Inter or Space Grotesk), `clamp(3rem, 8vw, 7rem)`
- **Subtext**: Small, light, understated — one line: "Custom Software Solutions"
- Negative letter-spacing on heading for modern density

### Layout

- Full-viewport (`100vh`) single section
- Heading centered vertically and horizontally
- Particles fill the entire viewport behind and around the text
- No navbar, no footer, no scroll — pure immersion
- Optional: subtle scroll indicator dot or breathing chevron at bottom

## Particle System Specification

### Core Physics

- **Particle count**: 800-1200 (adaptive based on device performance)
- **Each particle has**: position (x, y), velocity (vx, vy), radius (1-4px), color, opacity, life
- **Gravity**: None — particles drift freely in 2D space
- **Friction/damping**: Slight velocity decay (`velocity *= 0.998`) for natural deceleration
- **Boundary behavior**: Particles wrap around edges seamlessly (toroidal space)

### Mouse Interaction (the key feature)

- **Attraction zone**: Particles within 200px of cursor gently pull toward it
- **Repulsion on click/press**: Burst particles outward from cursor with force falloff
- **Trail effect**: Mouse movement spawns faint trailing particles that fade out
- **Connection lines**: Draw thin lines (`0.5px`, low opacity) between particles within 120px of each other — creates a constellation/mesh effect near the cursor
- **Force formula**: `force = strength / (distance^2)` clamped to max velocity

### Visual Effects

- **Glow**: Each particle renders with a subtle radial gradient (soft edge, not hard circle)
- **Color blending**: Particles shift between cyan, violet, and pink based on velocity or proximity to cursor
- **Opacity breathing**: Particles gently pulse opacity (`sin(time + offset)`) for organic feel
- **Bloom post-processing**: Optional canvas composite operation for glow bleed (`lighter` blend mode)

### Performance

- Use `requestAnimationFrame` loop
- Spatial hashing or grid partitioning for neighbor lookups (connection lines)
- Detect low FPS and reduce particle count dynamically
- Use `OffscreenCanvas` or web worker if needed for heavy computation
- Target: 60fps on modern machines, graceful degradation to 30fps

## Implementation Steps

### Phase 1: Project Setup
1. Initialize SvelteKit 5 project with TypeScript
2. Install and configure Tailwind CSS v4
3. Set up project structure:
   ```
   src/
     lib/
       particles/
         engine.ts        — main simulation loop
         physics.ts       — force calculations, velocity updates
         renderer.ts      — canvas drawing logic
         spatial-grid.ts  — spatial partitioning for performance
         types.ts         — Particle, Vec2, Config interfaces
       components/
         ParticleCanvas.svelte  — canvas component with Svelte 5 lifecycle
         Hero.svelte            — heading + subtext overlay
     routes/
       +page.svelte       — single page composition
       +layout.svelte     — global styles, font loading
   ```

### Phase 2: Particle Engine
4. Define particle data structures and configuration types
5. Implement particle initialization (random positions, velocities, colors)
6. Build physics update loop (velocity, position, damping, wrapping)
7. Implement spatial grid for efficient neighbor queries
8. Add mouse force calculations (attract + repel)

### Phase 3: Rendering
9. Create canvas component with proper Svelte 5 lifecycle (`$effect`)
10. Implement particle drawing with glow/gradient rendering
11. Add connection lines between nearby particles
12. Implement color interpolation based on velocity
13. Add bloom/glow composite pass

### Phase 4: Interaction Polish
14. Mouse tracking with smooth interpolation
15. Click-to-repel burst effect
16. Mouse trail particle spawning
17. Touch support for mobile (touch = cursor position)

### Phase 5: UI Layer
18. Overlay the "Cullen Software" heading with CSS (not in canvas)
19. Add "Custom Software Solutions" subtext
20. Style with Tailwind — centered, responsive sizing
21. Ensure text sits cleanly above canvas with pointer-events passthrough

### Phase 6: Performance & Polish
22. Add FPS monitoring and adaptive particle count
23. Test on mobile — reduce particles, simplify effects
24. Add subtle CSS entrance animation for heading (fade in + slight rise)
25. Fine-tune physics constants for satisfying feel
26. Prefers-reduced-motion: disable particles, show static gradient

## Key Principles

- **Physics first**: The particles should feel real. Invest time in tuning damping, force curves, and velocities until the motion is satisfying.
- **Restraint**: Dark background, minimal text, no UI chrome. Let the particles be the experience.
- **Performance is a feature**: Janky particles ruin immersion. Prioritize smooth 60fps over particle count.
- **Interactive = alive**: The cursor interaction is what makes this special. It should feel like you're touching the particles.

## Commands

```bash
# Dev
npm run dev

# Build
npm run build

# Preview production build
npm run preview
```
