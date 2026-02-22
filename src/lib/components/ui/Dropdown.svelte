<script lang="ts">
	let show = $state(false);
	let { label, children } = $props<{ label: string, children: any }>();
</script>

<div role="navigation" class="dropdown-container" onmouseleave={() => show = false}>
	<button class="menu-item" onclick={() => show = !show}>
		{label}
	</button>
	{#if show}
		<button class="dropdown-content" onclick={() => show = false}>
		  {@render children()}
		</button>
	{/if}
</div>

<style>
	.dropdown-container {
		position: relative;
		display: inline-block;
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
	.dropdown-content {
		display: block;
		position: absolute;
		background-color: var(--color-bg-med);
		min-width: 160px;
		box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
		z-index: 1;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		padding: 4px 0;
	}
	/* We will style the slotted content from the parent */
</style>
