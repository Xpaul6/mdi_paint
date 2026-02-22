<script lang="ts">
	import type { Document } from '../stores/documentStore';
	import { selectedTool, brushColor, brushSize } from '../stores/toolStore';
	import { cursorPosition } from '../stores/uiStore';
	import { BROWSER } from 'esm-env';
	import { documentStore } from '../stores/documentStore';

	let { document }: { document: Document } = $props();

	let canvasElement: HTMLCanvasElement;
	let context: CanvasRenderingContext2D | null = $state(null);

	let isDrawing = $state(false);
	let lastX = $state(0);
	let lastY = $state(0);

	// Load initial data and resize canvas
	$effect(() => {
		if (canvasElement && BROWSER) {
			const parent = canvasElement.parentElement;
			if (parent) {
				canvasElement.width = parent.clientWidth;
				canvasElement.height = parent.clientHeight;
			}
			context = canvasElement.getContext('2d');
			if (context) {
				// Fill background
				context.fillStyle = '#ffffff';
				context.fillRect(0, 0, canvasElement.width, canvasElement.height);

				if (document.data) {
					const img = new Image();
					img.onload = () => {
						context?.drawImage(img, 0, 0);
					};
					img.src = document.data;
				}
			}
		}
	});

	function getCoords(e: PointerEvent) {
		const rect = canvasElement.getBoundingClientRect();
		return {
			x: Math.round(e.clientX - rect.left),
			y: Math.round(e.clientY - rect.top)
		};
	}

	function handlePointerDown(e: PointerEvent) {
		if (!context) return;
		isDrawing = true;
		const { x, y } = getCoords(e);
		[lastX, lastY] = [x, y];
	}

	function draw(x: number, y: number) {
		if (!context) return;
		context.beginPath();
		context.moveTo(lastX, lastY);
		context.lineTo(x, y);

		const tool = $selectedTool;
		if (tool === 'eraser') {
			context.globalCompositeOperation = 'destination-out';
		} else {
			context.globalCompositeOperation = 'source-over';
			context.strokeStyle = $brushColor;
		}

		context.lineWidth = $brushSize;
		context.lineCap = 'round';
		context.lineJoin = 'round';
		context.stroke();
		[lastX, lastY] = [x, y];
	}

	function handlePointerMove(e: PointerEvent) {
		const { x, y } = getCoords(e);
		cursorPosition.set({ x, y });
		if (!isDrawing) return;
		draw(x, y);
	}

	function handlePointerLeave() {
		stopDrawing();
		cursorPosition.set({ x: 0, y: 0 });
	}

	function stopDrawing() {
		if (!isDrawing) return;
		isDrawing = false;
		// Update document state after drawing is complete
		const dataUrl = canvasElement.toDataURL('image/png');
		documentStore.updateActiveDocumentData(dataUrl);
	}
</script>

<canvas
	bind:this={canvasElement}
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={stopDrawing}
	onpointerleave={handlePointerLeave}
></canvas>

<style>
	canvas {
		width: 100%;
		height: 100%;
		display: block;
		cursor: crosshair;
	}
</style>
