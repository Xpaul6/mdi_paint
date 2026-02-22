<script lang="ts">
	import Canvas from '../Canvas.svelte';
</script>

<div class="workspace-container">
	<div class="canvas-wrapper">
		<Canvas />
	</div>
</div>

<style>
	.workspace-container {
		flex-grow: 1;
		padding: 10px;
		background-color: var(--color-bg-deep);
		display: flex;
		flex-direction: column;
	}

	.canvas-wrapper {
		flex-grow: 1;
		background-color: var(--color-bg-light);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		overflow: hidden; /* Ensures canvas stays within borders */
	}
</style>
