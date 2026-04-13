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
