<script lang="ts">
	let { hidden = false }: { hidden?: boolean } = $props();

	let visible = $state(false);

	$effect(() => {
		// Slight delay for entrance animation
		const timer = setTimeout(() => (visible = true), 200);
		return () => clearTimeout(timer);
	});
</script>

<div class="hero" class:visible class:hidden>
	<h1 class="heading">Cullen Software</h1>
	<p class="subtext">Custom Software Solutions</p>
</div>

<style>
	.hero {
		position: fixed;
		inset: 0;
		z-index: 10;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		pointer-events: none;
		opacity: 0;
		transform: translateY(12px);
		transition:
			opacity 1.2s ease,
			transform 1.2s ease;
	}

	.hero.visible {
		opacity: 1;
		transform: translateY(0);
	}

	.hero.hidden {
		opacity: 0;
		transition: opacity 0.4s ease;
	}

	.heading {
		font-size: clamp(2.5rem, 8vw, 7rem);
		font-weight: 700;
		letter-spacing: -0.03em;
		color: #f0f0f5;
		margin: 0;
		text-align: center;
		text-shadow:
			0 0 60px rgba(125, 255, 245, 0.15),
			0 0 120px rgba(125, 255, 245, 0.05);
		user-select: none;
	}

	.subtext {
		font-size: clamp(0.85rem, 1.5vw, 1.1rem);
		font-weight: 300;
		color: #6b7280;
		margin: 0.75rem 0 0;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		user-select: none;
	}
</style>
