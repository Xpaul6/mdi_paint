<script lang="ts">
	import { cursorPosition } from '../../stores/uiStore';
	import { selectedTool, brushSize } from '../../stores/toolStore';
	import { zoomLevel } from '../../stores/viewStore';

	function zoomIn() {
		zoomLevel.update((level) => Math.round((level + 0.1) * 10) / 10);
	}

	function zoomOut() {
		zoomLevel.update((level) => Math.max(0.1, Math.round((level - 0.1) * 10) / 10));
	}
</script>

<div class="statusbar-container">
	<div class="info-group left">
		<span>Tool: {$selectedTool}</span>
	</div>
	<div class="info-group center">
		<button on:click={zoomOut}>-</button>
		<span>{($zoomLevel * 100).toFixed(0)}%</span>
		<button on:click={zoomIn}>+</button>
	</div>
	<div class="info-group right">
		<span>Size: {$brushSize}px</span>
		<span>Coords: {$cursorPosition.x}, {$cursorPosition.y}</span>
	</div>
</div>

<style>
	.statusbar-container {
		background-color: var(--color-accent);
		color: white;
		padding: 0 12px;
		font-size: 12px;
		flex-shrink: 0;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.info-group {
		display: flex;
		gap: 20px;
		align-items: center;
	}

	.center {
		gap: 8px;
	}

	.center button {
		background: none;
		border: 1px solid white;
		color: white;
		border-radius: 4px;
		width: 20px;
		height: 20px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.center button:hover {
		background-color: rgba(255, 255, 255, 0.2);
	}
</style>
