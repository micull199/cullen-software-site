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
