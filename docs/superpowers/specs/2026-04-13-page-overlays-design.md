# Page Overlay System Design

## Overview

Transform the existing horizontal top-right nav into a vertical right-side button stack. Each button opens a full-viewport overlay page with a right-to-left morph animation. Three pages: About, Projects, Inquire.

## Navigation

- Three buttons stacked vertically on the right edge, centered vertically
- Same understated styling as current nav (muted text, uppercase, small)
- "Inquire" keeps its cyan accent border treatment
- Nav hides when a page overlay is open
- Entrance animation: delayed fade-in + slide from right (matching current behavior)

## Animation Spec

### Opening
1. Panel originates from the clicked button's Y position on the right edge
2. Expands and slides left to fill the full viewport
3. Duration: 500-600ms
4. Easing: `cubic-bezier(0.4, 0, 0.2, 1)`
5. Background: `#0a0a0f` (same as site bg) — fully opaque
6. Page content fades in with ~200ms delay after panel lands

### Closing
1. Close button (X) in top-right corner of the overlay
2. Reverse animation: panel contracts back toward right edge
3. Same duration and easing as open
4. Nav reappears after close animation completes

## Page Content

### About
- Section header: "About"
- 2-3 paragraphs about Cullen Software: custom software, approach, philosophy
- Left-aligned text, generous whitespace, Space Grotesk font
- Subtle cyan accent separator

### Projects
- Section header: "Projects"
- 3-4 project cards in a vertical list or grid
- Each card: project name, 1-2 line description, tech tags
- Subtle border/surface styling against dark bg
- Placeholder content

### Inquire
- Section header: "Inquire"
- Clean minimal form:
  - Name (text input)
  - Email (email input)
  - "Tell us about your project" (textarea)
- Submit button with cyan accent styling
- UI only — no backend submission

## Architecture

- No new SvelteKit routes — overlays are components managed by state
- State: `$state<'about' | 'projects' | 'inquire' | null>(null)` in `+page.svelte`
- Particle canvas stays mounted underneath (just hidden by opaque overlay)

### New/Modified Files
- `src/lib/components/Nav.svelte` — rework to vertical right-side layout
- `src/lib/components/PageOverlay.svelte` — animation wrapper component
- `src/lib/components/AboutPage.svelte` — about content
- `src/lib/components/ProjectsPage.svelte` — projects content
- `src/lib/components/InquirePage.svelte` — form content
- `src/routes/+page.svelte` — add state management and overlay rendering

## Styling

- All pages use the existing color palette (CSS variables in app.css)
- Typography: Space Grotesk, consistent with hero
- Form inputs: dark surface (`#141420` or similar), subtle border, rounded
- Focus states on inputs: cyan glow border
- Responsive: content should stack cleanly on mobile
