<script lang="ts">
	import type { Snippet } from 'svelte';

	let { open, onClose, children }: { open: boolean; onClose: () => void; children: Snippet } = $props();

	let mounted = $state(false);
	let animateIn = $state(false);

	$effect(() => {
		if (open) {
			mounted = true;
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					animateIn = true;
				});
			});
		} else {
			animateIn = false;
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
		background: rgba(10, 10, 15, 0.88);
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
