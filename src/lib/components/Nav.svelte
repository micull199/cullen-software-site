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
