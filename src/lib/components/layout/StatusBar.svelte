<script lang="ts">
	import { cursorPosition } from '../../stores/uiStore';
	import { selectedTool, brushSize } from '../../stores/toolStore';
</script>

<div class="statusbar-container">
	<div class="info-group left">
		<span>Tool: {$selectedTool}</span>
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
	}
</style>
