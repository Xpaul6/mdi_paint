<script lang="ts">
  import type { Document } from '../../stores/documentStore';

	let { document, isActive, onSelect, onClose } = $props<{
		document: Document;
		isActive: boolean;
		onSelect: (id: string) => void;
		onClose: (id: string) => void;
	}>();
</script>

<div role="navigation" class="tab" class:active={isActive} onclick={() => onSelect(document.id)}>
	<span class="tab-name">{document.name}{#if document.isDirty}*{/if}</span>
	<button class="close-tab-btn" onclick={(e) => {
		e.stopPropagation(); // prevent selection when closing
		onClose(document.id)
	}}>&times;</button>
</div>

<style>
	.tab {
		display: flex;
		align-items: center;
		padding: 8px 12px;
		background-color: var(--color-bg-light);
		border-right: 1px solid var(--color-border);
		cursor: pointer;
		color: var(--color-text-secondary);
		border-bottom: 2px solid transparent;
	}
	.tab:hover {
		background-color: var(--color-bg-med);
	}
	.tab.active {
		background-color: var(--color-bg-deep);
		color: var(--color-text-primary);
		border-bottom: 2px solid var(--color-accent);
	}
	.tab-name {
		padding-right: 8px;
		white-space: nowrap;
	}
	.close-tab-btn {
		background: none;
		border: none;
		color: var(--color-text-secondary);
		border-radius: 50%;
		width: 18px;
		height: 18px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}
	.close-tab-btn:hover {
		background-color: var(--color-bg-light);
		color: var(--color-text-primary);
	}
</style>
