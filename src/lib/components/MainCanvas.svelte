<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let width: number = 0;
  let height: number = 0;

  export const getCanvas = (): HTMLCanvasElement => {
    return canvas;
  }

  onMount(() => {
    width = window.innerWidth;
    height = window.innerHeight;

    const frame = () => {
      requestAnimationFrame(frame);
    };
    frame();
  });
</script>

<canvas bind:this={canvas} {width} {height}></canvas>