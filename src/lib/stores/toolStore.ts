import { writable } from 'svelte/store';

export type Tool = 'pen' | 'eraser';

export const selectedTool = writable<Tool>('pen');
export const brushColor = writable('#000000');
export const brushSize = writable(5);
