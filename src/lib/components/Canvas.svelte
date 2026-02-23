<script lang="ts">
	import type { Document } from '../stores/documentStore';
	import { selectedTool, brushColor, brushSize, type Tool } from '../stores/toolStore';
	import { cursorPosition } from '../stores/uiStore';
	import { BROWSER } from 'esm-env';
	import { documentStore } from '../stores/documentStore';
	import { zoomLevel } from '../stores/viewStore';
	import { tick } from 'svelte';

	let { document }: { document: Document } = $props();

	// Cursor mapping 
	const toolCursors: Record<Tool, string> = {
		pen: 'crosshair',
		eraser: 'crosshair',
		line: 'crosshair',
		ellipse: 'crosshair',
		fill: 'copy',
		text: 'text',
		smiley: 'pointer'
	};

	let cursorStyle = $derived(toolCursors[$selectedTool] ?? 'default');

	// Canvas elements and contexts
	let canvasElement: HTMLCanvasElement;
	let previewCanvasElement: HTMLCanvasElement;
	let context: CanvasRenderingContext2D | null = $state(null);
	let previewContext: CanvasRenderingContext2D | null = $state(null);
	
	// General state
	let isDrawing = $state(false);

	// Tool-specific state
	let lastX = $state(0);
	let lastY = $state(0);
	let startX = $state(0);
	let startY = $state(0);

	// Text tool state
	let textInputElement: HTMLInputElement;
	let isTextToolActive = $state(false);
	let textInputX = $state(0);
	let textInputY = $state(0);
	let textInputValue = $state('');

	// Tool Handlers
	const toolHandlers = {
		pen: {
			onPointerDown: (x: number, y: number) => { [lastX, lastY] = [x, y]; },
			onPointerMove: (x: number, y: number) => drawPen(x, y),
			onPointerUp: () => {}
		},
		eraser: {
			onPointerDown: (x: number, y: number) => { [lastX, lastY] = [x, y]; },
			onPointerMove: (x: number, y: number) => drawPen(x, y, true),
			onPointerUp: () => {}
		},
		line: {
			onPointerDown: (x: number, y: number) => { [startX, startY] = [x, y]; },
			onPointerMove: (x: number, y: number) => drawLinePreview(x, y),
			onPointerUp: (x: number, y: number) => {
				if (!context || !previewContext) return;
				previewContext.clearRect(0, 0, previewCanvasElement.width, previewCanvasElement.height);
				context.globalCompositeOperation = 'source-over';
				context.strokeStyle = $brushColor;
				context.lineWidth = $brushSize;
				context.lineCap = 'round';
				context.lineJoin = 'round';
				context.beginPath();
				context.moveTo(startX, startY);
				context.lineTo(x, y);
				context.stroke();
			}
		},
		ellipse: {
			onPointerDown: (x: number, y: number) => { [startX, startY] = [x, y]; },
			onPointerMove: (x: number, y: number) => drawEllipsePreview(x, y),
			onPointerUp: (x: number, y: number) => {
				if (!context || !previewContext) return;
				previewContext.clearRect(0, 0, previewCanvasElement.width, previewCanvasElement.height);
				context.globalCompositeOperation = 'source-over';
				context.strokeStyle = $brushColor;
				context.lineWidth = $brushSize;
				context.lineCap = 'round';
				context.lineJoin = 'round';
				context.beginPath();
				const radiusX = Math.abs(x - startX) / 2;
				const radiusY = Math.abs(y - startY) / 2;
				const centerX = startX + (x - startX) / 2;
				const centerY = startY + (y - startY) / 2;
				context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
				context.stroke();
			}
		},
		fill: {
			onPointerDown: (x: number, y: number) => {
				floodFill(x, y);
				documentStore.updateActiveDocumentData(canvasElement.toDataURL('image/png'));
			},
			onPointerMove: () => {},
			onPointerUp: () => {}
		},
		smiley: {
			onPointerDown: (x: number, y: number) => {
				drawSmiley(x, y);
				documentStore.updateActiveDocumentData(canvasElement.toDataURL('image/png'));
			},
			onPointerMove: () => {},
			onPointerUp: () => {}
		},
		text: {
			onPointerDown: async (x: number, y: number) => {
				if (isTextToolActive) await commitText();
				isTextToolActive = true;
				textInputX = x;
				textInputY = y;
				await tick();
				textInputElement?.focus();
			},
			onPointerMove: () => {},
			onPointerUp: () => {}
		}
	};

	// Canvas Setup and Lifecycle
	function handleResize() {
		if (!canvasElement || !context || !previewCanvasElement) return;
		const parent = canvasElement.parentElement;
		if (!parent) return;

		const tempCanvas = window.document.createElement('canvas');
		tempCanvas.width = canvasElement.width;
		tempCanvas.height = canvasElement.height;
		const tempCtx = tempCanvas.getContext('2d');
		tempCtx?.drawImage(canvasElement, 0, 0);

		const { clientWidth, clientHeight } = parent;
		canvasElement.width = clientWidth;
		canvasElement.height = clientHeight;
		previewCanvasElement.width = clientWidth;
		previewCanvasElement.height = clientHeight;

		context.drawImage(tempCanvas, 0, 0);
	}

	$effect(() => {
		if (canvasElement && previewCanvasElement && BROWSER) {
			context = canvasElement.getContext('2d', { willReadFrequently: true });
			previewContext = previewCanvasElement.getContext('2d');
			const parent = canvasElement.parentElement;
			if (parent) {
				canvasElement.width = parent.clientWidth;
				canvasElement.height = parent.clientHeight;
				previewCanvasElement.width = parent.clientWidth;
				previewCanvasElement.height = parent.clientHeight;
			}
			if (context) {
				if (document.data) {
					const img = new Image();
					img.onload = () => context?.drawImage(img, 0, 0);
					img.src = document.data;
				} else {
					context.fillStyle = '#ffffff';
					context.fillRect(0, 0, canvasElement.width, canvasElement.height);
				}
			}
		}
	});

	// Main Pointer Event Handlers
	function handlePointerDown(e: PointerEvent) {
		if (!context) return;
		const { x, y } = getCoords(e);
		const tool = $selectedTool;
		
		const handler = toolHandlers[tool];
		if (handler) {
			if (tool !== 'text' && tool !== 'fill' && tool !== 'smiley') {
				isDrawing = true;
			}
			handler.onPointerDown(x, y);
		}
	}

	function handlePointerMove(e: PointerEvent) {
		const { x, y } = getCoords(e);
		cursorPosition.set({ x, y });
		if (!isDrawing) return;

		const handler = toolHandlers[$selectedTool];
		handler?.onPointerMove(x, y);
	}

	function stopDrawing(e?: PointerEvent) {
		if (!isDrawing) return;
		isDrawing = false;
		
		const { x, y } = getCoords(e || new PointerEvent('pointerup'));
		const handler = toolHandlers[$selectedTool];
		handler?.onPointerUp(x, y);

		documentStore.updateActiveDocumentData(canvasElement.toDataURL('image/png'));
	}

	function getCoords(e: PointerEvent) {
		const rect = canvasElement.getBoundingClientRect();
		return {
			x: Math.round((e.clientX - rect.left) / $zoomLevel),
			y: Math.round((e.clientY - rect.top) / $zoomLevel)
		};
	}

	// Drawing Implementations
	function drawPen(x: number, y: number, isEraser = false) {
		if (!context) return;
		context.beginPath();
		context.moveTo(lastX, lastY);
		context.lineTo(x, y);
		context.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
		context.strokeStyle = $brushColor;
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
	
		context.beginPath();
		context.arc(x, y, radius, 0, Math.PI * 2, true); 
		context.moveTo(x + radius * 0.7, y + radius * 0.2);
		context.arc(x, y + radius * 0.2, radius * 0.7, 0, Math.PI, false);
		context.moveTo(x - radius * 0.25 + radius * 0.1, y - radius * 0.3);
		context.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.1, 0, Math.PI * 2, true);
		context.moveTo(x + radius * 0.35 + radius * 0.1, y - radius * 0.3);
		context.arc(x + radius * 0.3, y - radius * 0.3, radius * 0.1, 0, Math.PI * 2, true);
		context.stroke();
	}

	async function commitText() {
		if (!context || !textInputValue) return;
		context.font = `${$brushSize * 2}px sans-serif`;
		context.fillStyle = $brushColor;
		context.textAlign = 'left';
		context.textBaseline = 'top';
		context.fillText(textInputValue, textInputX, textInputY);

		isTextToolActive = false;
		textInputValue = '';
		await tick();
		documentStore.updateActiveDocumentData(canvasElement.toDataURL('image/png'));
	}

</script>

<svelte:window on:resize={handleResize} />

<div class="canvas-wrapper" style="cursor: {cursorStyle}">
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
		onpointerleave={stopDrawing}
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
