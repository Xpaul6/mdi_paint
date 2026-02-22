<script lang="ts">
	import { isAboutModalOpen } from '../../stores/uiStore';
</script>

<div class="ribbon-container">
	<div class="menu">
		<button class="menu-item">File</button>
		<button class="menu-item">Edit</button>
		<button class="menu-item">Tools</button>
		<button class="menu-item">Window</button>
		<button class="menu-item" on:click={() => isAboutModalOpen.set(true)}>Help</button>
	</div>
</div>

<style>
	.ribbon-container {
		background-color: var(--color-bg-med);
		padding: 0 12px;
		border-bottom: 1px solid var(--color-border);
		flex-shrink: 0;
		height: 40px; /* Approximate height */
		display: flex;
		align-items: center;
	}

	.menu-item {
		background: none;
		border: none;
		color: var(--color-text-primary);
		padding: 8px 12px;
		cursor: pointer;
		border-radius: 4px;
	}

	.menu-item:hover {
		background-color: var(--color-bg-light);
	}
</style>
