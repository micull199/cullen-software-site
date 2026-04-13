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

<ParticleCanvas overlayOpen={activePage !== null} />
<Nav {activePage} onNavigate={handleNavigate} />
<Hero hidden={activePage !== null} />

<PageOverlay open={activePage === 'about'} onClose={handleClose}>
	<AboutPage />
</PageOverlay>

<PageOverlay open={activePage === 'projects'} onClose={handleClose}>
	<ProjectsPage />
</PageOverlay>

<PageOverlay open={activePage === 'inquire'} onClose={handleClose}>
	<InquirePage />
</PageOverlay>
