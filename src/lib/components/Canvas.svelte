<script lang="ts">
	import type { Document } from '../stores/documentStore';
	import { selectedTool, brushColor, brushSize } from '../stores/toolStore';
	import { cursorPosition } from '../stores/uiStore';
	import { BROWSER } from 'esm-env';
	import { documentStore } from '../stores/documentStore';
	import { tick } from 'svelte';

	let { document }: { document: Document } = $props();

	let canvasElement: HTMLCanvasElement;
	let previewCanvasElement: HTMLCanvasElement;
	let context: CanvasRenderingContext2D | null = $state(null);
	let previewContext: CanvasRenderingContext2D | null = $state(null);
	let textInputElement: HTMLInputElement;

	let isDrawing = $state(false);
	// For pen/eraser
	let lastX = $state(0);
	let lastY = $state(0);
	// For line/ellipse
	let startX = $state(0);
	let startY = $state(0);

	// For text tool
	let isTextToolActive = $state(false);
	let textInputX = $state(0);
	let textInputY = $state(0);
	let textInputValue = $state('');


	// Load initial data and resize canvas
	$effect(() => {
		if (canvasElement && previewCanvasElement && BROWSER) {
			const parent = canvasElement.parentElement;
			if (parent) {
				const { clientWidth, clientHeight } = parent;
				canvasElement.width = clientWidth;
				canvasElement.height = clientHeight;
				previewCanvasElement.width = clientWidth;
				previewCanvasElement.height = clientHeight;
			}
			context = canvasElement.getContext('2d', { willReadFrequently: true });
			previewContext = previewCanvasElement.getContext('2d');

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

	function hexToRgb(hex: string): [number, number, number] {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result
			? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
			: [0, 0, 0];
	}

	function floodFill(x: number, y: number) {
		if (!context) return;

		const imageData = context.getImageData(0, 0, canvasElement.width, canvasElement.height);
		const data = imageData.data;
		const startIdx = (y * canvasElement.width + x) * 4;
		const targetColor = [data[startIdx], data[startIdx + 1], data[startIdx + 2], data[startIdx + 3]];
		const replacementColor = [...hexToRgb($brushColor), 255];

		if (
			targetColor[0] === replacementColor[0] &&
			targetColor[1] === replacementColor[1] &&
			targetColor[2] === replacementColor[2] &&
			targetColor[3] === replacementColor[3]
		) {
			return;
		}

		const queue: [number, number][] = [[x, y]];

		while (queue.length > 0) {
			const [px, py] = queue.shift()!;

			if (px < 0 || px >= canvasElement.width || py < 0 || py >= canvasElement.height) {
				continue;
			}

			const idx = (py * canvasElement.width + px) * 4;
			const currentColor = [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];

			if (
				currentColor[0] === targetColor[0] &&
				currentColor[1] === targetColor[1] &&
				currentColor[2] === targetColor[2] &&
				currentColor[3] === targetColor[3]
			) {
				data[idx] = replacementColor[0];
				data[idx + 1] = replacementColor[1];
				data[idx + 2] = replacementColor[2];
				data[idx + 3] = replacementColor[3];

				queue.push([px + 1, py]);
				queue.push([px - 1, py]);
				queue.push([px, py + 1]);
				queue.push([px, py - 1]);
			}
		}

		context.putImageData(imageData, 0, 0);
	}

	function drawSmiley(x: number, y: number) {
		if (!context) return;
	
		const radius = $brushSize * 4;
		context.strokeStyle = $brushColor;
		context.lineWidth = Math.max(1, $brushSize / 4);
	
		// Head
		context.beginPath();
		context.arc(x, y, radius, 0, Math.PI * 2, true); // Outer circle
		
		// Mouth
		context.moveTo(x + radius * 0.7, y + radius * 0.2);
		context.arc(x, y + radius * 0.2, radius * 0.7, 0, Math.PI, false); // Mouth (clockwise)
		
		// Eyes
		context.moveTo(x - radius * 0.25 + radius * 0.1, y - radius * 0.3);
		context.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.1, 0, Math.PI * 2, true); // Left eye
		context.moveTo(x + radius * 0.35 + radius * 0.1, y - radius * 0.3);
		context.arc(x + radius * 0.3, y - radius * 0.3, radius * 0.1, 0, Math.PI * 2, true); // Right eye
		
		context.stroke();
	}

	function getCoords(e: PointerEvent) {
		const rect = canvasElement.getBoundingClientRect();
		return {
			x: Math.round(e.clientX - rect.left),
			y: Math.round(e.clientY - rect.top)
		};
	}

	function commitText() {
		if (!context || !textInputValue) return;
		context.font = `${$brushSize * 2}px sans-serif`;
		context.fillStyle = $brushColor;
		context.textAlign = 'left';
		context.textBaseline = 'top';
		context.fillText(textInputValue, textInputX, textInputY);

		isTextToolActive = false;
		textInputValue = '';
		documentStore.updateActiveDocumentData(canvasElement.toDataURL('image/png'));
	}

	async function handlePointerDown(e: PointerEvent) {
		if (!context) return;
		const { x, y } = getCoords(e);
		const tool = $selectedTool;

		if (isTextToolActive) {
			commitText();
		}

		if (tool === 'smiley') {
			drawSmiley(x, y);
			documentStore.updateActiveDocumentData(canvasElement.toDataURL('image/png'));
			return;
		}

		if (tool === 'text') {
			isTextToolActive = true;
			textInputX = x;
			textInputY = y;
			await tick(); // Wait for the DOM to update
			textInputElement?.focus();
			return;
		}

		if (tool === 'fill') {
			floodFill(x, y);
			documentStore.updateActiveDocumentData(canvasElement.toDataURL('image/png'));
			return;
		}

		isDrawing = true;

		if (tool === 'line' || tool === 'ellipse') {
			startX = x;
			startY = y;
		} else {
			[lastX, lastY] = [x, y];
		}
	}

	function drawPen(x: number, y: number) {
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

	function drawLinePreview(x: number, y: number) {
		if (!previewContext) return;
		previewContext.clearRect(0, 0, previewCanvasElement.width, previewCanvasElement.height);
		previewContext.beginPath();
		previewContext.moveTo(startX, startY);
		previewContext.lineTo(x, y);
		previewContext.strokeStyle = $brushColor;
		previewContext.lineWidth = $brushSize;
		previewContext.lineCap = 'round';
		previewContext.lineJoin = 'round';
		previewContext.stroke();
	}

	function drawEllipsePreview(x: number, y: number) {
		if (!previewContext) return;
		previewContext.clearRect(0, 0, previewCanvasElement.width, previewCanvasElement.height);
		previewContext.beginPath();
		const radiusX = Math.abs(x - startX) / 2;
		const radiusY = Math.abs(y - startY) / 2;
		const centerX = startX + (x - startX) / 2;
		const centerY = startY + (y - startY) / 2;
		previewContext.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
		previewContext.strokeStyle = $brushColor;
		previewContext.lineWidth = $brushSize;
		previewContext.stroke();
	}


	function handlePointerMove(e: PointerEvent) {
		const { x, y } = getCoords(e);
		cursorPosition.set({ x, y });
		if (!isDrawing) return;

		const tool = $selectedTool;
		if (tool === 'pen' || tool === 'eraser') {
			drawPen(x, y);
		} else if (tool === 'line') {
			drawLinePreview(x,y);
		} else if (tool === 'ellipse') {
			drawEllipsePreview(x, y);
		}
	}

	function handlePointerLeave() {
		stopDrawing();
		cursorPosition.set({ x: 0, y: 0 });
	}

	function stopDrawing(e?: PointerEvent) {
		if (!isDrawing) return;
		isDrawing = false;
		const tool = $selectedTool;

		if (e && context && previewContext) {
			const { x, y } = getCoords(e);
			previewContext.clearRect(0, 0, previewCanvasElement.width, previewCanvasElement.height);
			context.globalCompositeOperation = 'source-over';
			context.strokeStyle = $brushColor;
			context.lineWidth = $brushSize;
			context.lineCap = 'round';
			context.lineJoin = 'round';

			if (tool === 'line') {
				context.beginPath();
				context.moveTo(startX, startY);
				context.lineTo(x, y);
				context.stroke();
			} else if (tool === 'ellipse') {
				context.beginPath();
				const radiusX = Math.abs(x - startX) / 2;
				const radiusY = Math.abs(y - startY) / 2;
				const centerX = startX + (x - startX) / 2;
				const centerY = startY + (y - startY) / 2;
				context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
				context.stroke();
			}
		}

		// Update document state after drawing is complete
		const dataUrl = canvasElement.toDataURL('image/png');
		documentStore.updateActiveDocumentData(dataUrl);
	}
</script>

<div class="canvas-wrapper" style="cursor: {$selectedTool === 'smiley' ? 'pointer' : $selectedTool === 'text' ? 'text' : $selectedTool === 'fill' ? 'copy' : ($selectedTool === 'line' || $selectedTool === 'ellipse' ? 'crosshair' : 'default')}">
	{#if isTextToolActive}
		<input
			type="text"
			class="text-input"
			style="top: {textInputY}px; left: {textInputX}px; font-size: {$brushSize * 2}px; color: {$brushColor};"
			bind:this={textInputElement}
			bind:value={textInputValue}
			onblur={commitText}
			onkeydown={(e) => e.key === 'Enter' && commitText()}
		/>
	{/if}
	<canvas
		class="main-canvas"
		bind:this={canvasElement}
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={stopDrawing}
		onpointerleave={handlePointerLeave}
	></canvas>
	<canvas class="preview-canvas" bind:this={previewCanvasElement}></canvas>
</div>


<style>
	.canvas-wrapper {
		width: 100%;
		height: 100%;
		position: relative;
	}

	.main-canvas, .preview-canvas {
		display: block;
		position: absolute;
		top: 0;
		left: 0;
	}
	
	.preview-canvas {
		pointer-events: none;
	}

	.text-input {
		position: absolute;
		background: transparent;
		border: 1px dashed grey;
		outline: none;
		padding: 2px;
		z-index: 10;
	}
</style>

