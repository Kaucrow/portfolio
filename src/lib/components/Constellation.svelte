<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment'; // Import 'browser' to check if we are in the browser environment

  import { Line } from '$lib/engine/Line';
  import { Camera } from '$lib/engine/Camera.svelte';

  interface Star {
    id: number;
    x: number;
    y: number;
  }

  export let stars: Star[] = []; // Array of { id: number, x: number, y: number }
  export let connections: [number, number][] = []; // Array of [starId1, starId2]
  export let constellationColor: string = '#fff1e8'; // Default color
  export let starSize: number = 10; // Default star size
  export let title: string = '';
  export let subtitle: string = '';

  let canvas: HTMLCanvasElement; // Reference to the canvas DOM element
  let ctx: CanvasRenderingContext2D | null;    // Canvas rendering context
  let camera: Camera | null;
  let canvasWidth: number = 0;
  let canvasHeight: number = 0;

  // Function to draw the constellation on the canvas
  function drawConstellation(): void {
    if (!ctx || !canvas) {
      // console.warn("Canvas context or canvas element not ready for drawing."); // Uncomment for debugging
      return;
    }

    // console.log(`Drawing constellation. Canvas dimensions: ${canvas.width}x${canvas.height}`); // Uncomment for debugging

    // Clear the canvas before redrawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set drawing styles
    ctx.strokeStyle = constellationColor; // Color for lines
    ctx.fillStyle = constellationColor;   // Color for stars and text

    // Store star positions in a map for easy lookup by ID
    const starPositions = new Map<number, Star>();
    stars.forEach(star => {
      starPositions.set(star.id, star);
    });

    // Draw lines for connections
    connections.forEach(connection => {
      const [startId, endId] = connection;
      const startStar = starPositions.get(startId);
      const endStar = starPositions.get(endId);

      if (startStar && endStar && ctx) {
        if (!camera) return;

        const fromPos = camera.htmlToScreen(startStar.x, startStar.y);
        const toPos = camera.htmlToScreen(endStar.x, endStar.y);

        const line = new Line(constellationColor, 1);
        line.from = { x: fromPos.x, y: fromPos.y };
        line.to = { x: toPos.x, y: toPos.y };
        line.draw(ctx, camera, 0, 0);
      }
    });

    // Draw each star as a square and its number
    stars.forEach(star => {
      // Calculate top-left corner for the square to center it
      const x = star.x - starSize / 2;
      const y = star.y - starSize / 2;

      if (!ctx) return;

      // Draw the square star
      ctx.fillRect(x, y, starSize, starSize);

      // Draw the star number
      ctx.font = `${starSize * 1.5}px Arial`; // Adjust font size relative to star size
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Position text slightly below and to the right of the star for better visibility
      ctx.fillText(star.id.toString(), star.x + starSize, star.y + starSize);
    });
  }

  // Function to resize the canvas based on its parent container
  function resizeCanvas(): void {
    if (canvas) {
      const parent = canvas.parentElement;
      if (parent) {
        let maxX = 0;
        let maxY = 0;

        stars.forEach(star => {
          if (star.x > maxX) {
            maxX = star.x;
          }
          if (star.y > maxY) {
            maxY = star.y
          }
        });

        // Set canvas CSS dimensions based on content
        canvas.style.width = maxX.toString() + 'px';
        canvas.style.height = maxY.toString() + 'px';

        canvas.width = maxX + 10;
        canvas.height = maxY + 10;
        canvasWidth = maxX + 10;
        canvasHeight = maxY + 10;
        // console.log(`Canvas resized to: ${canvas.width}x${canvas.height}`); // Uncomment for debugging
        drawConstellation(); // Redraw after resize
      } else {
        // console.warn("Parent element not found for canvas resizing."); // Uncomment for debugging
      }
    } else {
      // console.warn("Canvas element not found for resizing."); // Uncomment for debugging
    }
  }

  // Lifecycle hook: runs after the component is first rendered to the DOM
  onMount(() => {
    // Ensure we are in the browser environment before accessing window
    if (browser) {
      ctx = canvas.getContext('2d');
      requestAnimationFrame(() => {
        resizeCanvas(); // Initial resize and draw
      });
      // Initialize camera after canvas dimensions are potentially set by resizeCanvas
      // This might need adjustment based on how Camera.svelte expects its initial width/height
      camera = new Camera(canvas.width, canvas.height);
      window.addEventListener('resize', resizeCanvas); // Add resize listener
    }
  });

  // Lifecycle hook: runs when the component is unmounted from the DOM
  onDestroy(() => {
    // Only remove listener if we are in the browser
    if (browser) {
      window.removeEventListener('resize', resizeCanvas); // Clean up listener
    }
  });

  $: stars, connections, constellationColor, starSize, drawConstellation();
  $: title, subtitle;
</script>

<div class="bg-black relative p-2 cursor-pointer overflow-hidden border-2 border-[var(--fg-color)] transition-transform duration-300 hover:-translate-y-4"
     style="backface-visibility: hidden; transform: translateZ(0); -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <!-- Canvas element -->
  <canvas
    class=""
    bind:this={canvas}
    aria-label="Constellation Canvas"
  ></canvas>

  <!-- Overlay for responsiveness feedback (optional) -->
  <div class="absolute bottom-2 right-2 text-xs text-gray-500">
    Canvas: {canvasWidth}x{canvasHeight}px
  </div>

  {#if title}
    <div
      style="color: {constellationColor}; backface-visibility: hidden; transform: translateZ(0); -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;"
      class="text-[2em] p-0 m-0"
    >
      {title}
    </div>

    {#if subtitle}
      <div
        style="color: {constellationColor}; backface-visibility: hidden; transform: translateZ(0); -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;"
        class="text-[1em] p-0 m-0"
      >
        {subtitle}
      </div>
    {/if}
  {/if}
</div>

<style></style>