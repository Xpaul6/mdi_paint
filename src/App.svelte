<script lang="ts">
  import Ribbon from './lib/components/layout/Ribbon.svelte';
  import StatusBar from './lib/components/layout/StatusBar.svelte';
  import Toolbar from './lib/components/layout/Toolbar.svelte';
  import Workspace from './lib/components/layout/Workspace.svelte';
	import AboutModal from './lib/components/AboutModal.svelte';
	import { isAboutModalOpen, toolbarPosition } from './lib/stores/uiStore';
	import { documentStore } from './lib/stores/documentStore';
	import { selectedTool } from './lib/stores/toolStore';

	function handleKeyDown(e: KeyboardEvent) {
		// Don't trigger hotkeys if user is typing in an input
		if (e.target instanceof HTMLInputElement) return;

		// Tool selection
		switch (e.key.toLowerCase()) {
			case 'p': selectedTool.set('pen'); break;
			case 'e': selectedTool.set('eraser'); break;
			case 'l': selectedTool.set('line'); break;
			case 'o': selectedTool.set('ellipse'); break;
			case 'f': selectedTool.set('fill'); break;
			case 't': selectedTool.set('text'); break;
			case 's': selectedTool.set('smiley'); break;
		}

		// File commands
		if (e.ctrlKey) {
			switch (e.key.toLowerCase()) {
				case 'n':
					e.preventDefault();
					documentStore.addDocument();
					break;
				case 'o':
					e.preventDefault();
					window.dispatchEvent(new CustomEvent('app-open-file'));
					break;
				case 's':
					e.preventDefault();
					window.dispatchEvent(new CustomEvent('app-save-file'));
					break;
			}
		}
	}
</script>

<svelte:window on:keydown={handleKeyDown} />

{#if $isAboutModalOpen}
	<AboutModal />
{/if}

<div class="app-container">
  <Ribbon />
  <div class="main-content">
		{#if $toolbarPosition === 'left'}
			<Toolbar />
			<Workspace />
		{:else}
			<Workspace />
			<Toolbar />
		{/if}
  </div>
  <StatusBar />
</div>

<style>
  .app-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
  }

  .main-content {
    display: flex;
    flex-grow: 1;
    overflow: hidden;
  }
</style>
