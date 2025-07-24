<script lang="ts">
	import '../app.css';
  import MainCanvas from '$lib/components/MainCanvas.svelte';
  import { onMount } from 'svelte';
  import { useScene } from '$lib/engine/Scene.svelte'; // Import the hook

  const { sceneState, setCanvas } = useScene();

  let mainCanvas: MainCanvas;

  onMount(() => {
    if (mainCanvas && !sceneState.isInitialized) {
      setCanvas(mainCanvas.getCanvas());
      // In here, the $effect in scene.svelte.ts
      // that watches sceneState.canvas will trigger
      // the full initialization.
    }
  });

  let { children } = $props();
</script>

<div class="absolute inset-0 z-20 pointer-events-none">
  <MainCanvas bind:this={mainCanvas}/>
</div>

{@render children()}
