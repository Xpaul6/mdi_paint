<script lang="ts">
	import { documentStore } from '../../stores/documentStore';
	import Canvas from '../Canvas.svelte';
	import Tab from '../ui/Tab.svelte';
	import { BROWSER } from 'esm-env';

  let activeDoc = $derived($documentStore.documents.find(d => d.id === $documentStore.activeDocumentId));

	function closeDocument(id: string) {
		const doc = $documentStore.documents.find(d => d.id === id);
		if (!doc) return;

		if (doc.isDirty && BROWSER) {
			const shouldClose = confirm(`Close "${doc.name}" without saving?`);
			if (!shouldClose) {
				return;
			}
		}

		documentStore.closeDocument(id);
	}
</script>

<div class="workspace-container">
	<div class="tabs-bar">
		{#each $documentStore.documents as doc (doc.id)}
			<Tab
				document={doc}
				isActive={doc.id === $documentStore.activeDocumentId}
				onSelect={documentStore.setActive}
				onClose={closeDocument}
			/>
		{/each}
	</div>

	<div class="canvas-wrapper">
		{#if activeDoc}
			<Canvas document={activeDoc} />
		{/if}
	</div>
</div>

<style>
	.workspace-container {
		flex-grow: 1;
		background-color: var(--color-bg-deep);
		display: flex;
		flex-direction: column;
		overflow: hidden; /* contain canvas wrapper */
	}
	.tabs-bar {
		display: flex;
		flex-shrink: 0;
		background-color: var(--color-bg-med);
		border-bottom: 1px solid var(--color-border);
		overflow-x: auto;
	}
	.canvas-wrapper {
		flex-grow: 1;
		background-color: var(--color-bg-deep);
		padding: 10px;
		min-height: 0; /* Important for flex-grow in a flex column */
	}
</style>
