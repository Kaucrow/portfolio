<!-- StarsBackground.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';

  // Import your star image asset
  import bgStarsImg from '$lib/assets/bg_stars.png';

  export let patternSize: number = 128; // Expected size of the original image (e.g., 128x128px)
  export let maxDisplacement: number = 20; // Max random displacement for each pattern tile (pixels)
  export let rotationEnabled: boolean = true; // Whether to apply random rotation to pattern tiles
  export let globalScale: number = 2; // New prop: Global scale factor for each pattern image

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null;
  let starPatternImage: HTMLImageElement | null = null; // To hold the loaded image

  // Function to draw the background with the pattern and randomness
  function drawBackground(): void {
    if (!ctx || !canvas || !starPatternImage) return;

    // Clear the main canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Define possible rotation angles in radians (0, 90, 180, 270 degrees)
    const rotationAngles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];

    // Calculate the scaled pattern size
    const scaledPatternSize = patternSize * globalScale;

    // Create a temporary offscreen canvas for pre-transforming each pattern tile
    // Its dimensions should match the scaled size of the pattern
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = scaledPatternSize;
    tempCanvas.height = scaledPatternSize;
    const tempCtx = tempCanvas.getContext('2d');

    if (!tempCtx) return; // Ensure tempCtx is available

    // Loop to fill the canvas with the pattern, ensuring perfect tiling
    // Increment by the scaled pattern size to avoid gaps
    for (let x = -scaledPatternSize; x < canvas.width + scaledPatternSize; x += scaledPatternSize) {
      for (let y = -scaledPatternSize; y < canvas.height + scaledPatternSize; y += scaledPatternSize) {

        // Clear the temporary canvas for the current tile
        tempCtx.clearRect(0, 0, scaledPatternSize, scaledPatternSize);
        tempCtx.save(); // Save tempCtx state before transformations

        // Translate to the center of the temporary canvas (which is now scaledPatternSize / 2)
        tempCtx.translate(scaledPatternSize / 2, scaledPatternSize / 2);

        // Apply random rotation if enabled
        if (rotationEnabled) {
          const randomAngle = rotationAngles[Math.floor(Math.random() * rotationAngles.length)];
          tempCtx.rotate(randomAngle);
        }

        // Apply random displacement (relative to the center of the tile)
        // This shifts the pattern within its scaled tile, not the tile itself.
        const offsetX = (Math.random() - 0.5) * 2 * maxDisplacement;
        const offsetY = (Math.random() - 0.5) * 2 * maxDisplacement;
        tempCtx.translate(offsetX, offsetY);

        // Draw the original image onto the temporary canvas, scaled to the pattern size
        // It's drawn centered around the new origin (which includes displacement).
        tempCtx.imageSmoothingEnabled = false; // Keep pixelated look if desired
        tempCtx.drawImage(starPatternImage, -scaledPatternSize / 2, -scaledPatternSize / 2, scaledPatternSize, scaledPatternSize);

        tempCtx.restore(); // Restore tempCtx state to remove transformations for the next tile

        // Now draw the pre-transformed tile from the temporary canvas onto the main canvas
        // at the current grid position (x, y).
        ctx.drawImage(tempCanvas, x, y);
      }
    }
  }

  // Function to resize the canvas and redraw
  function resizeCanvas(): void {
    if (canvas) {
      // Set canvas CSS dimensions to fill the parent
      canvas.style.width = '100%';
      canvas.style.height = '100%';

      // Get actual computed pixel dimensions
      const parent = canvas.parentElement;
      if (parent) {
        const rect = parent.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      } else {
        // Fallback if no parent, or if parent has no dimensions yet
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      drawBackground(); // Redraw after resize
    }
  }

  onMount(() => {
    if (browser) {
      ctx = canvas.getContext('2d');

      // Load the star pattern image
      starPatternImage = new Image();
      starPatternImage.src = bgStarsImg; // Use the imported image path
      starPatternImage.onload = () => {
        // Once the image is loaded, perform initial resize and draw
        resizeCanvas();
      };
      starPatternImage.onerror = () => {
        console.error('Failed to load star pattern image:', bgStarsImg);
      };

      // Initial resize and draw (will draw empty until image loads)
      resizeCanvas();

      window.addEventListener('resize', resizeCanvas);
    }
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener('resize', resizeCanvas);
    }
  });

  // Reactive declaration: redraw if pattern properties, image loaded status, or globalScale change
  $: patternSize, maxDisplacement, rotationEnabled, globalScale, starPatternImage, drawBackground();
</script>

<div class="absolute inset-0 overflow-hidden -z-10">
  <canvas
    bind:this={canvas}
    class="block w-full h-full"
    aria-label="Stars Background"
  ></canvas>
</div>

<style></style>