<script lang="ts">
	import { selectedTool, type Tool, brushColor, brushSize } from '../../stores/toolStore';
  import penIcon from '../../../assets/pen.png';
  import eraserIcon from '../../../assets/eraser.png';
  import lineIcon from '../../../assets/line.png';
  import ellipseIcon from '../../../assets/ellipse.png';
  import fillIcon from '../../../assets/fill.png';
  import smileIcon from '../../../assets/happiness.png';

	function selectTool(tool: Tool) {
		selectedTool.set(tool);
	}
</script>

<div class="toolbar-container">
	<div class="tool-group">
		<button
			class="tool-button"
			class:active={$selectedTool === 'pen'}
			on:click={() => selectTool('pen')}
			title="Pen"
		>
      <img src={penIcon} alt="P" class="icon">
		</button>
		<button
			class="tool-button"
			class:active={$selectedTool === 'eraser'}
			on:click={() => selectTool('eraser')}
			title="Eraser"
		>
      <img src={eraserIcon} alt="E" class="icon">
		</button>
		<button
			class="tool-button"
			class:active={$selectedTool === 'line'}
			on:click={() => selectTool('line')}
			title="Line"
		>
      <img src={lineIcon} alt="L" class="icon">
		</button>
		<button
			class="tool-button"
			class:active={$selectedTool === 'ellipse'}
			on:click={() => selectTool('ellipse')}
			title="Ellipse"
		>
      <img src={ellipseIcon} alt="El" class="icon">
		</button>
		<button
			class="tool-button"
			class:active={$selectedTool === 'fill'}
			on:click={() => selectTool('fill')}
			title="Fill"
		>
      <img src={fillIcon} alt="F" class="icon">
		</button>
		<button
			class="tool-button"
			class:active={$selectedTool === 'text'}
			on:click={() => selectTool('text')}
			title="Text"
		>
			T
		</button>
		<button
			class="tool-button"
			class:active={$selectedTool === 'smiley'}
			on:click={() => selectTool('smiley')}
			title="Smiley"
		>
      <img src={smileIcon} alt=":)" class="icon">
		</button>
	</div>
	<div class="settings-group">
		<div class="setting">
			<label for="color-picker">Color</label>
			<input type="color" id="color-picker" bind:value={$brushColor} title="Brush Color"/>
		</div>
		<div class="setting">
			<label for="brush-size">Size</label>
			<input type="range" id="brush-size" min="1" max="50" bind:value={$brushSize} title="Brush Size" />
			<span>{$brushSize}</span>
		</div>
	</div>
</div>

<style>
	.toolbar-container {
		background-color: var(--color-bg-med);
		width: 130px;
		border-right: 1px solid var(--color-border);
		flex-shrink: 0;
		padding: 8px;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.tool-group {
		display: flex;
    flex-wrap: wrap;
		gap: 8px;
	}

	.tool-button {
		width: 36px;
		height: 36px;
		background-color: var(--color-bg-light);
		border: 1px solid var(--color-border);
		color: var(--color-text-primary);
		border-radius: 4px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 16px;
		font-weight: bold;
	}

	.tool-button:hover {
		background-color: var(--color-accent);
		border-color: var(--color-accent);
	}

	.tool-button.active {
		background-color: var(--color-accent);
		border-color: var(--color-accent);
		outline: 1px solid white;
	}

	.settings-group {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.setting {
		display: flex;
		flex-direction: column;
		gap: 8px;
		color: var(--color-text-secondary);
		font-size: 12px;
	}

	.setting label {
		padding-left: 2px;
	}

	.setting input[type="color"] {
		width: 100%;
		height: 30px;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		padding: 2px;
		background-color: var(--color-bg-light);
	}

	.setting input[type="range"] {
		width: 100%;
	}

	.setting span {
		text-align: center;
		color: var(--color-text-primary);
		font-size: 14px;
	}

  .icon {
    width: 100%;
  }
</style>
