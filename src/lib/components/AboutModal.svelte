<script lang="ts">
  import Modal from './ui/Modal.svelte';
  import { isAboutModalOpen } from '../stores/uiStore';
</script>

<Modal
  close={() => isAboutModalOpen.set(false)}
  header={'About MDI Paint'}
  main={`
  <p>
    A web-based image editor inspired by classic MSPaint.<br />
    Powered by Svelte 5<br />
    By Pavel Kholkin 2026
  </p>
  `}
/>
