<script lang="ts">
	import Dropdown from '../ui/Dropdown.svelte';
	import { documentStore } from '../../stores/documentStore';
	import { isAboutModalOpen, toolbarPosition } from '../../stores/uiStore';
	import { BROWSER } from 'esm-env';

	let fileInput: HTMLInputElement;

  let activeDoc = $derived($documentStore.documents.find(d => d.id === $documentStore.activeDocumentId));

	function openFile() {
		fileInput.click();
	}

	function handleFileOpen(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			const file = target.files[0];
			const reader = new FileReader();
			reader.onload = (event) => {
				if (event.target?.result) {
					documentStore.addDocument(event.target.result as string, file.name);
				}
			};
			reader.readAsDataURL(file);
			target.value = '';
		}
	}

	function saveAs() {
		if (!BROWSER) return;
		const doc = activeDoc;
		if (!doc || !doc.data) return;

		const link = document.createElement('a');
		link.href = doc.data;
		link.download = `${doc.name}.png`;
		link.click();
		documentStore.setActiveDocumentSaved();
	}

	function toggleToolbar() {
		toolbarPosition.update(pos => pos === 'left' ? 'right' : 'left');
	}

	$effect(() => {
		if (!BROWSER) return;
		
		const handleOpen = () => openFile();
		const handleSave = () => {
			// We only trigger save if the document is dirty, just like the button
			if(activeDoc?.isDirty) {
				saveAs();
			}
		}

		window.addEventListener('app-open-file', handleOpen);
		window.addEventListener('app-save-file', handleSave);

		return () => {
			window.removeEventListener('app-open-file', handleOpen);
			window.removeEventListener('app-save-file', handleSave);
		}
	});

</script>

<div class="ribbon-container">
	<div class="menu">
		<Dropdown label="File">
			<button class="dropdown-item" onclick={() => documentStore.addDocument()}>New <span class="hint">(Ctrl+N)</span></button>
			<button class="dropdown-item" onclick={openFile}>Open... <span class="hint">(Ctrl+O)</span></button>
			<button class="dropdown-item" onclick={saveAs} disabled={!activeDoc?.isDirty}>Save As... <span class="hint">(Ctrl+S)</span></button>
		</Dropdown>
		<Dropdown label="Edit">
			<button class="dropdown-item" disabled>Undo</button>
			<button class="dropdown-item" disabled>Redo</button>
		</Dropdown>
		<Dropdown label="View">
			<button class="dropdown-item" onclick={toggleToolbar}>Toggle Toolbar</button>
		</Dropdown>
		<Dropdown label="Help">
			<button class="dropdown-item" onclick={() => isAboutModalOpen.set(true)}>About</button>
		</Dropdown>
	</div>
</div>

<!-- Hidden file input for opening files -->
<input type="file" bind:this={fileInput} onchange={handleFileOpen} accept="image/png, image/jpeg" style="display: none;"/>

<style>
	.ribbon-container {
		background-color: var(--color-bg-med);
		padding: 0 12px;
		border-bottom: 1px solid var(--color-border);
		flex-shrink: 0;
		height: 40px;
		display: flex;
		align-items: center;
	}
	.menu {
		display: flex;
		gap: 4px;
	}

	.hint {
		color: var(--color-text-secondary);
		float: right;
		margin-left: 24px;
	}

	:global(.dropdown-item) {
		display: block;
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		color: var(--color-text-primary);
		padding: 8px 16px;
		cursor: pointer;
	}
	:global(.dropdown-item:hover) {
		background-color: var(--color-accent);
	}
	:global(.dropdown-item:disabled) {
		color: var(--color-text-secondary);
		cursor: not-allowed;
	}
</style>
