<script lang="ts">
  import Modal from './ui/Modal.svelte';
  import { isAboutModalOpen } from '../stores/uiStore';
</script>

<Modal
  close={() => isAboutModalOpen.set(false)}
  header={'About MDI Paint'}
  main={`
  <p>
    A web-based image editor inspired by classic MDI applications.
  </p>
  <p>
    Version: 0.1.0 (In Development)<br />
    Framework: Svelte
  </p>
  `}
/>
