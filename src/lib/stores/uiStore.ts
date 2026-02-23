import { writable } from 'svelte/store';

export const isAboutModalOpen = writable(false);
export const cursorPosition = writable({ x: 0, y: 0 });
export const toolbarPosition = writable<'left' | 'right'>('left');
