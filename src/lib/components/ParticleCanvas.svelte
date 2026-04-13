<script lang="ts">
	import { ParticleEngine } from '$lib/particles/engine';

	let { overlayOpen = false }: { overlayOpen?: boolean } = $props();

	let canvas: HTMLCanvasElement;
	let engine: ParticleEngine | null = null;

	$effect(() => {
		if (canvas) {
			engine = new ParticleEngine(canvas);
			engine.start();
			return () => engine?.stop();
		}
	});

	$effect(() => {
		if (engine) {
			engine.mouseEnabled = !overlayOpen;
		}
	});
</script>

<canvas bind:this={canvas} class="particle-canvas"></canvas>

<style>
	.particle-canvas {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 0;
		cursor: default;
	}
</style>
