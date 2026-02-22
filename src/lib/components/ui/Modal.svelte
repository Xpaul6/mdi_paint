<script lang="ts">
  let { close, header, main } = $props();
</script>

<div class="backdrop" onclick={() => close()}></div>
<div class="modal">
  <header>
    <h2>{header}</h2>
    <button class="close-btn" onclick={() => close()}>&times;</button>
  </header>
  <main>
    {@html main}
  </main>
</div>

<style>
  .backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 10;
  }

  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 500px;
    background-color: var(--color-bg-med);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    z-index: 11;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--color-border);
  }

  h2 {
    margin: 0;
    font-size: 1.2em;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    color: var(--color-text-secondary);
    cursor: pointer;
  }

  main {
    padding: 16px;
  }
</style>
