# Page Overlay System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three full-viewport page overlays (About, Projects, Inquire) triggered by vertical right-side nav buttons with a premium right-to-left morph animation.

**Architecture:** State-driven overlays managed in `+page.svelte` via a `$state` variable (`'about' | 'projects' | 'inquire' | null`). Nav.svelte is reworked to vertical layout and emits page selection via a callback prop. A PageOverlay wrapper component handles the slide animation, and three content components render inside it.

**Tech Stack:** SvelteKit 5 (Svelte 5 runes), TypeScript, CSS transitions/animations, Space Grotesk font

---

### Task 1: Rework Nav.svelte to Vertical Right-Side Layout

**Files:**
- Modify: `src/lib/components/Nav.svelte`

- [ ] **Step 1: Update Nav.svelte to accept props and use vertical layout**

Replace the entire content of `src/lib/components/Nav.svelte` with:

```svelte
<script lang="ts">
	let { activePage = null, onNavigate }: { activePage: string | null; onNavigate: (page: string) => void } = $props();

	let visible = $state(false);

	$effect(() => {
		const timer = setTimeout(() => (visible = true), 600);
		return () => clearTimeout(timer);
	});
</script>

<nav class="nav" class:visible class:hidden={activePage !== null}>
	<button class="nav-link" onclick={() => onNavigate('about')}>About</button>
	<button class="nav-link" onclick={() => onNavigate('projects')}>Projects</button>
	<button class="nav-link nav-link--cta" onclick={() => onNavigate('inquire')}>Inquire</button>
</nav>

<style>
	.nav {
		position: fixed;
		top: 50%;
		right: 0;
		transform: translateY(-50%) translateX(0);
		z-index: 20;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 1.25rem;
		padding: 2rem 2rem;
		opacity: 0;
		transition:
			opacity 0.8s ease,
			transform 0.8s ease;
	}

	.nav.visible {
		opacity: 1;
	}

	.nav.hidden {
		opacity: 0;
		transform: translateY(-50%) translateX(20px);
		pointer-events: none;
	}

	.nav-link {
		font-size: 0.8rem;
		font-weight: 400;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: rgba(240, 240, 245, 0.4);
		text-decoration: none;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem 1.2rem;
		transition: color 0.3s ease;
		pointer-events: auto;
		font-family: inherit;
	}

	.nav-link:hover {
		color: rgba(240, 240, 245, 0.85);
	}

	.nav-link--cta {
		color: rgba(60, 180, 170, 0.5);
		border: 1px solid rgba(60, 180, 170, 0.15);
		border-radius: 100px;
		transition:
			color 0.3s ease,
			border-color 0.3s ease,
			background 0.3s ease;
	}

	.nav-link--cta:hover {
		color: rgba(60, 180, 170, 0.9);
		border-color: rgba(60, 180, 170, 0.35);
		background: rgba(60, 180, 170, 0.05);
	}

	@media (max-width: 640px) {
		.nav {
			gap: 1rem;
			padding: 1.5rem 1rem;
		}

		.nav-link {
			font-size: 0.7rem;
		}
	}
</style>
```

- [ ] **Step 2: Verify the dev server runs without errors**

Run: `npm run dev`
Expected: No compilation errors. Nav buttons should appear vertically on right side of screen.

- [ ] **Step 3: Commit**

```bash
git add src/lib/components/Nav.svelte
git commit -m "refactor: rework Nav to vertical right-side button layout"
```

---

### Task 2: Create PageOverlay Animation Wrapper

**Files:**
- Create: `src/lib/components/PageOverlay.svelte`

- [ ] **Step 1: Create PageOverlay.svelte**

Create `src/lib/components/PageOverlay.svelte`:

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { open, onClose, children }: { open: boolean; onClose: () => void; children: Snippet } = $props();

	let mounted = $state(false);
	let animateIn = $state(false);

	$effect(() => {
		if (open) {
			mounted = true;
			// Trigger animation on next frame so the DOM is ready
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					animateIn = true;
				});
			});
		} else {
			animateIn = false;
			// Wait for exit animation to finish before unmounting
			const timer = setTimeout(() => {
				mounted = false;
			}, 600);
			return () => clearTimeout(timer);
		}
	});

	function handleClose() {
		onClose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			handleClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if mounted}
	<div class="overlay" class:animate-in={animateIn}>
		<button class="close-btn" onclick={handleClose} aria-label="Close">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
				<line x1="18" y1="6" x2="6" y2="18" />
				<line x1="6" y1="6" x2="18" y2="18" />
			</svg>
		</button>
		<div class="content" class:content-visible={animateIn}>
			{@render children()}
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 30;
		background: #0a0a0f;
		transform: translateX(100%);
		transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
		overflow-y: auto;
		overflow-x: hidden;
	}

	.overlay.animate-in {
		transform: translateX(0);
	}

	.content {
		max-width: 720px;
		margin: 0 auto;
		padding: 6rem 2.5rem 4rem;
		opacity: 0;
		transform: translateX(30px);
		transition:
			opacity 0.4s ease 0.25s,
			transform 0.4s ease 0.25s;
	}

	.content.content-visible {
		opacity: 1;
		transform: translateX(0);
	}

	.close-btn {
		position: fixed;
		top: 2rem;
		right: 2rem;
		z-index: 31;
		background: none;
		border: 1px solid rgba(240, 240, 245, 0.1);
		border-radius: 50%;
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: rgba(240, 240, 245, 0.4);
		transition:
			color 0.3s ease,
			border-color 0.3s ease,
			background 0.3s ease;
	}

	.close-btn:hover {
		color: rgba(240, 240, 245, 0.85);
		border-color: rgba(240, 240, 245, 0.25);
		background: rgba(240, 240, 245, 0.03);
	}

	@media (max-width: 640px) {
		.content {
			padding: 5rem 1.5rem 3rem;
		}
	}
</style>
```

- [ ] **Step 2: Verify no compilation errors**

Run: `npm run dev`
Expected: No errors. Component is not yet rendered anywhere.

- [ ] **Step 3: Commit**

```bash
git add src/lib/components/PageOverlay.svelte
git commit -m "feat: add PageOverlay animation wrapper component"
```

---

### Task 3: Create AboutPage Content Component

**Files:**
- Create: `src/lib/components/AboutPage.svelte`

- [ ] **Step 1: Create AboutPage.svelte**

Create `src/lib/components/AboutPage.svelte`:

```svelte
<div class="about">
	<h2 class="page-title">About</h2>
	<div class="divider"></div>

	<p class="body">
		Cullen Software is a custom software consultancy dedicated to building
		purposeful, high-quality digital products. We partner with businesses to
		transform ideas into reliable, scalable solutions — from initial concept
		through deployment and beyond.
	</p>

	<p class="body">
		Our approach is hands-on and collaborative. We believe the best software
		comes from deeply understanding the problem before writing a single line
		of code. Every project starts with listening — to your goals, your users,
		and the constraints that shape what success looks like.
	</p>

	<p class="body">
		We specialize in full-stack development, modern web applications, and
		systems that need to perform under real-world pressure. Whether you're
		launching something new or rethinking what you already have, we bring
		the technical depth and design sensibility to make it happen.
	</p>
</div>

<style>
	.about {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.page-title {
		font-size: clamp(2rem, 5vw, 3.5rem);
		font-weight: 700;
		letter-spacing: -0.03em;
		color: #f0f0f5;
		margin: 0;
	}

	.divider {
		width: 48px;
		height: 1px;
		background: rgba(125, 255, 245, 0.3);
	}

	.body {
		font-size: 1.05rem;
		font-weight: 300;
		line-height: 1.75;
		color: rgba(240, 240, 245, 0.65);
		margin: 0;
	}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/components/AboutPage.svelte
git commit -m "feat: add AboutPage content component"
```

---

### Task 4: Create ProjectsPage Content Component

**Files:**
- Create: `src/lib/components/ProjectsPage.svelte`

- [ ] **Step 1: Create ProjectsPage.svelte**

Create `src/lib/components/ProjectsPage.svelte`:

```svelte
<script lang="ts">
	const projects = [
		{
			name: 'Fleet Management Platform',
			description: 'Real-time vehicle tracking and route optimization system for a regional logistics company. Reduced average delivery times by 18% through intelligent dispatching.',
			tags: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'WebSocket']
		},
		{
			name: 'Clinical Data Pipeline',
			description: 'HIPAA-compliant data ingestion and reporting platform for a healthcare analytics firm. Processes and normalizes records from 30+ source formats.',
			tags: ['Python', 'AWS Lambda', 'S3', 'Redshift', 'Terraform']
		},
		{
			name: 'E-Commerce Storefront',
			description: 'High-performance headless storefront for a specialty retailer. Sub-second page loads with dynamic inventory and personalized recommendations.',
			tags: ['SvelteKit', 'Shopify API', 'Tailwind', 'Vercel']
		},
		{
			name: 'Internal Operations Suite',
			description: 'Unified dashboard replacing five disconnected spreadsheets for a growing fintech team. Automated weekly reporting that previously took 6 hours.',
			tags: ['Next.js', 'Prisma', 'tRPC', 'PostgreSQL']
		}
	];
</script>

<div class="projects">
	<h2 class="page-title">Projects</h2>
	<div class="divider"></div>

	<div class="project-list">
		{#each projects as project}
			<div class="project-card">
				<h3 class="project-name">{project.name}</h3>
				<p class="project-desc">{project.description}</p>
				<div class="tags">
					{#each project.tags as tag}
						<span class="tag">{tag}</span>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.projects {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.page-title {
		font-size: clamp(2rem, 5vw, 3.5rem);
		font-weight: 700;
		letter-spacing: -0.03em;
		color: #f0f0f5;
		margin: 0;
	}

	.divider {
		width: 48px;
		height: 1px;
		background: rgba(125, 255, 245, 0.3);
	}

	.project-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin-top: 0.5rem;
	}

	.project-card {
		padding: 1.75rem;
		border: 1px solid rgba(240, 240, 245, 0.06);
		border-radius: 12px;
		background: rgba(240, 240, 245, 0.02);
		transition:
			border-color 0.3s ease,
			background 0.3s ease;
	}

	.project-card:hover {
		border-color: rgba(240, 240, 245, 0.12);
		background: rgba(240, 240, 245, 0.035);
	}

	.project-name {
		font-size: 1.15rem;
		font-weight: 600;
		color: #f0f0f5;
		margin: 0 0 0.6rem;
	}

	.project-desc {
		font-size: 0.95rem;
		font-weight: 300;
		line-height: 1.7;
		color: rgba(240, 240, 245, 0.55);
		margin: 0 0 1rem;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.tag {
		font-size: 0.7rem;
		font-weight: 400;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: rgba(125, 255, 245, 0.5);
		border: 1px solid rgba(125, 255, 245, 0.12);
		padding: 0.25rem 0.65rem;
		border-radius: 100px;
	}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/components/ProjectsPage.svelte
git commit -m "feat: add ProjectsPage content component"
```

---

### Task 5: Create InquirePage Form Component

**Files:**
- Create: `src/lib/components/InquirePage.svelte`

- [ ] **Step 1: Create InquirePage.svelte**

Create `src/lib/components/InquirePage.svelte`:

```svelte
<script lang="ts">
	let name = $state('');
	let email = $state('');
	let message = $state('');
	let submitted = $state(false);

	function handleSubmit(e: Event) {
		e.preventDefault();
		submitted = true;
	}
</script>

<div class="inquire">
	<h2 class="page-title">Inquire</h2>
	<div class="divider"></div>

	{#if submitted}
		<div class="success">
			<p class="success-heading">Thank you.</p>
			<p class="success-body">We've received your message and will be in touch soon.</p>
		</div>
	{:else}
		<p class="intro">
			Tell us about the software you want to build. We'll get back to you
			within one business day.
		</p>

		<form class="form" onsubmit={handleSubmit}>
			<div class="field">
				<label class="label" for="name">Name</label>
				<input
					id="name"
					type="text"
					class="input"
					bind:value={name}
					required
					autocomplete="name"
				/>
			</div>

			<div class="field">
				<label class="label" for="email">Email</label>
				<input
					id="email"
					type="email"
					class="input"
					bind:value={email}
					required
					autocomplete="email"
				/>
			</div>

			<div class="field">
				<label class="label" for="message">Tell us about your project</label>
				<textarea
					id="message"
					class="input textarea"
					bind:value={message}
					required
					rows="5"
					placeholder="What problem are you trying to solve? What does success look like?"
				></textarea>
			</div>

			<button type="submit" class="submit-btn">Send Inquiry</button>
		</form>
	{/if}
</div>

<style>
	.inquire {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.page-title {
		font-size: clamp(2rem, 5vw, 3.5rem);
		font-weight: 700;
		letter-spacing: -0.03em;
		color: #f0f0f5;
		margin: 0;
	}

	.divider {
		width: 48px;
		height: 1px;
		background: rgba(125, 255, 245, 0.3);
	}

	.intro {
		font-size: 1.05rem;
		font-weight: 300;
		line-height: 1.75;
		color: rgba(240, 240, 245, 0.55);
		margin: 0;
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin-top: 0.5rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.label {
		font-size: 0.75rem;
		font-weight: 400;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: rgba(240, 240, 245, 0.4);
	}

	.input {
		font-family: inherit;
		font-size: 1rem;
		font-weight: 300;
		color: #f0f0f5;
		background: rgba(240, 240, 245, 0.03);
		border: 1px solid rgba(240, 240, 245, 0.08);
		border-radius: 8px;
		padding: 0.85rem 1rem;
		outline: none;
		transition:
			border-color 0.3s ease,
			box-shadow 0.3s ease;
	}

	.input::placeholder {
		color: rgba(240, 240, 245, 0.2);
	}

	.input:focus {
		border-color: rgba(125, 255, 245, 0.3);
		box-shadow: 0 0 0 3px rgba(125, 255, 245, 0.05);
	}

	.textarea {
		resize: vertical;
		min-height: 120px;
	}

	.submit-btn {
		align-self: flex-start;
		font-family: inherit;
		font-size: 0.85rem;
		font-weight: 500;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #0a0a0f;
		background: rgba(125, 255, 245, 0.85);
		border: none;
		border-radius: 100px;
		padding: 0.85rem 2.25rem;
		cursor: pointer;
		transition:
			background 0.3s ease,
			transform 0.15s ease;
	}

	.submit-btn:hover {
		background: rgba(125, 255, 245, 1);
	}

	.submit-btn:active {
		transform: scale(0.98);
	}

	.success {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 2rem 0;
	}

	.success-heading {
		font-size: 1.5rem;
		font-weight: 600;
		color: #f0f0f5;
		margin: 0;
	}

	.success-body {
		font-size: 1.05rem;
		font-weight: 300;
		color: rgba(240, 240, 245, 0.55);
		margin: 0;
	}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/components/InquirePage.svelte
git commit -m "feat: add InquirePage form component"
```

---

### Task 6: Wire Everything Together in +page.svelte

**Files:**
- Modify: `src/routes/+page.svelte`

- [ ] **Step 1: Update +page.svelte with state management and overlay rendering**

Replace the entire content of `src/routes/+page.svelte` with:

```svelte
<script lang="ts">
	import ParticleCanvas from '$lib/components/ParticleCanvas.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import Nav from '$lib/components/Nav.svelte';
	import PageOverlay from '$lib/components/PageOverlay.svelte';
	import AboutPage from '$lib/components/AboutPage.svelte';
	import ProjectsPage from '$lib/components/ProjectsPage.svelte';
	import InquirePage from '$lib/components/InquirePage.svelte';

	let activePage = $state<'about' | 'projects' | 'inquire' | null>(null);

	function handleNavigate(page: string) {
		activePage = page as 'about' | 'projects' | 'inquire';
	}

	function handleClose() {
		activePage = null;
	}
</script>

<ParticleCanvas />
<Nav {activePage} onNavigate={handleNavigate} />
<Hero />

<PageOverlay open={activePage === 'about'} onClose={handleClose}>
	<AboutPage />
</PageOverlay>

<PageOverlay open={activePage === 'projects'} onClose={handleClose}>
	<ProjectsPage />
</PageOverlay>

<PageOverlay open={activePage === 'inquire'} onClose={handleClose}>
	<InquirePage />
</PageOverlay>
```

- [ ] **Step 2: Start dev server and test all interactions**

Run: `npm run dev`

Test checklist:
- Three buttons visible vertically on right side
- Clicking each button opens its page with right-to-left slide animation
- Page content fades in after panel slides
- Close button (X) in top-right works
- Escape key closes the page
- Nav buttons hide when a page is open
- Nav buttons reappear when page closes
- Particle canvas stays behind the overlay
- Mobile viewport looks correct

- [ ] **Step 3: Commit**

```bash
git add src/routes/+page.svelte
git commit -m "feat: wire up page overlays with navigation state"
```

---

### Task 7: Visual Polish and Final Testing

**Files:**
- Potentially adjust: any of the above files based on browser testing

- [ ] **Step 1: Open browser and test the complete flow**

Run: `npm run dev`

Verify in browser:
1. Initial load: particles animate, hero fades in, nav buttons appear on right
2. Click "About" — panel sweeps in from right, content appears, close works
3. Click "Projects" — cards display properly, tags render, hover states work
4. Click "Inquire" — form renders, inputs are focusable, placeholder visible, submit shows success state
5. Rapid clicking between pages doesn't break animation state
6. Resize window to mobile width — layout remains usable

- [ ] **Step 2: Fix any visual issues found during testing**

Address any spacing, timing, or layout problems discovered in Step 1.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "polish: finalize page overlay system"
```
