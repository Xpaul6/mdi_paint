import { writable } from 'svelte/store';

export const isAboutModalOpen = writable(false);
export const cursorPosition = writable({ x: 0, y: 0 });
