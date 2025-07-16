<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';

  let canvas: HTMLCanvasElement;
  let width: number = 0;
  let height: number = 0;

  export const getCanvas = (): HTMLCanvasElement => {
    return canvas;
  }

  const updateCanvasDimensions = () => {
    if (browser) {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth * dpr;
      height = window.innerHeight * dpr;
    }
  }

  onMount(() => {
    updateCanvasDimensions();

    window.addEventListener('resize', updateCanvasDimensions);
  });

  onDestroy(() => {
    if (browser)
      window.removeEventListener('resize', updateCanvasDimensions);
  });
</script>

<canvas bind:this={canvas} {width} {height}></canvas>