<script lang="ts">
  import Ribbon from './lib/components/layout/Ribbon.svelte';
  import StatusBar from './lib/components/layout/StatusBar.svelte';
  import Toolbar from './lib/components/layout/Toolbar.svelte';
  import Workspace from './lib/components/layout/Workspace.svelte';
	import AboutModal from './lib/components/AboutModal.svelte';
	import { isAboutModalOpen } from './lib/stores/uiStore';
</script>

{#if $isAboutModalOpen}
	<AboutModal />
{/if}

<div class="app-container">
  <Ribbon />
  <div class="main-content">
    <Toolbar />
    <Workspace />
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
