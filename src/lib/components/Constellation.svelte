<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { fade } from 'svelte/transition';

  import { Line } from '$lib/engine/Line';
  import { Camera } from '$lib/engine/Camera.svelte';

  interface Star {
    id: number;
    x: number;
    y: number;
  }

  type Connection = [number, number];

  const {
    id = undefined,
    stars = [],
    connections = [],
    constellationColor = '#fff1e8',
    starSize = 10,
    cardTitle = '',
    cardSubtitle = '',
  } = $props<{
    id: number | undefined;
    stars: Star[];
    connections: Connection[];
    constellationColor?: string;
    starSize?: number;
    cardTitle?: string;
    cardSubtitle?: string;
  }>();

  let containerRef: HTMLDivElement;
  let placeholderRef: HTMLDivElement;

  let placeholderBoundingRect = $state<DOMRect>();
  let isExpanded = $state(false);
  let currentZIndex = $state(1); // Start with a default z-index (e.g., 1)

  let mainCanvas = $state<HTMLCanvasElement>();
  let ctx: CanvasRenderingContext2D | null = null;
  let camera: Camera | null = null;
  let canvasWidth: number = 0;
  let canvasHeight: number = 0;

  function calculateConstellationDimensions() {
    let maxX = 0;
    let maxY = 0;
    stars.forEach((star: Star) => {
      if (star.x > maxX) {
        maxX = star.x;
      }
      if (star.y > maxY) {
        maxY = star.y;
      }
    });
    const minSize = 100; // Ensure a minimum size
    return {
      width: Math.max(minSize, maxX + starSize * 2),
      height: Math.max(minSize, maxY + starSize * 2),
    };
  }

  function resizeAndDrawCanvas(canvasEl: HTMLCanvasElement): void {
    if (!browser || !canvasEl) return;

    // Use dimensions based on expansion state or placeholder
    let targetWidth, targetHeight;
    if (isExpanded) {
        // When expanded, the canvas should fill its container (90% width/height of viewport)
        // Adjust these as needed for your desired expanded canvas size
        targetWidth = window.innerWidth * 0.9;
        targetHeight = window.innerHeight * 0.9;
    } else {
        // When collapsed, canvas takes dimensions of the calculated constellation
        const { width, height } = calculateConstellationDimensions();
        targetWidth = width;
        targetHeight = height;
    }

    canvasEl.width = targetWidth;
    canvasEl.height = targetHeight;
    canvasEl.style.width = targetWidth + 'px';
    canvasEl.style.height = targetHeight + 'px'; // Ensure CSS matches canvas resolution

    canvasWidth = targetWidth;
    canvasHeight = targetHeight;

    if (canvasEl === mainCanvas) {
      ctx = mainCanvas.getContext('2d');
      // Re-initialize camera on resize if dimensions change
      if (!camera || camera.viewportWidth !== canvasWidth || camera.viewportHeight !== canvasHeight) {
        camera = new Camera(canvasWidth, canvasHeight);
      }
      drawConstellation(); // Redraw after resize
    }
  }

  let onclick: (event: MouseEvent | KeyboardEvent, constellationId: number | undefined) => void = (
    event,
    constellationId,
  ) => {
    if (browser) {
      if (event && (event.type === 'keydown' || event.type === 'keypress')) {
        event.preventDefault();
      }
      console.log(`Clicked on constellation ${constellationId}`);
      isExpanded = !isExpanded;
    }
  };

  function drawConstellation(): void {
    if (!ctx || !browser || !camera || !mainCanvas) {
      console.warn('Cannot draw constellation: missing ctx, browser, camera, or mainCanvas');
      return;
    }

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = constellationColor;
    ctx.fillStyle = constellationColor;

    const starPositions = new Map<number, Star>();
    stars.forEach((star: Star) => {
      starPositions.set(star.id, star);
    });

    connections.forEach((connection: Connection) => {
      const [startId, endId] = connection;
      const startStar = starPositions.get(startId);
      const endStar = starPositions.get(endId);

      if (startStar && endStar && camera && ctx) {
        // Assuming camera.htmlToScreen transforms raw star coordinates to canvas coordinates
        const fromPos = camera.htmlToScreen(startStar.x, startStar.y);
        const toPos = camera.htmlToScreen(endStar.x, endStar.y);

        const line = new Line(constellationColor, 1);
        line.from = { x: fromPos.x, y: fromPos.y };
        line.to = { x: toPos.x, y: toPos.y };
        line.draw(ctx, camera, 0, 0);
      }
    });

    stars.forEach((star: Star) => {
      // Apply camera transformation for star positions
      if (!camera || !ctx) return;

      const x = star.x - starSize / 2;
      const y = star.y - starSize / 2;

      ctx.fillRect(x, y, starSize, starSize);

      // Adjust text position relative to the star and camera
      ctx.font = `${starSize * 1.5}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(star.id.toString(), star.x + starSize, star.y + starSize);
    });
  }

  onMount(() => {
    if (browser) {
      // Use requestAnimationFrame for initial measurement
      const measurePlaceholder = () => {
        if (placeholderRef) {
          const rect = placeholderRef.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            placeholderBoundingRect = rect;
            console.log(`Constellation ${id}: Initial placeholderBoundingRect resolved!`, placeholderBoundingRect);
          } else {
            // If still not ready, try again on the next frame
            requestAnimationFrame(measurePlaceholder);
          }
        }
      };
      requestAnimationFrame(measurePlaceholder);

      const handleResize = () => {
        if (placeholderRef) {
          // Update placeholderBoundingRect on resize
          placeholderBoundingRect = placeholderRef.getBoundingClientRect();
          console.log(`Constellation ${id}: placeholderBoundingRect updated on resize!`, placeholderBoundingRect);
        }
        if (mainCanvas) {
          resizeAndDrawCanvas(mainCanvas); // Recalculate and redraw main canvas
        }
      };
      window.addEventListener('resize', handleResize);

      onDestroy(() => {
        window.removeEventListener('resize', handleResize);
      });
    }
  });

  // Effect to handle mainCanvas appearance and redraw
  $effect(() => {
    if (mainCanvas && browser) {
      console.log(`Constellation ${id}: Main canvas appeared in DOM or updated.`);
      resizeAndDrawCanvas(mainCanvas);
    }
  });

  // React to changes in isExpanded to control z-index
  $effect(() => {
    if (isExpanded) {
      currentZIndex = 50; // Set high z-index when expanded
    }
  });

  // Function to handle the end of the transition
  function handleTransitionEnd() {
    if (!isExpanded) {
      currentZIndex = 1; // Revert z-index when collapse transition is complete
    }
  }
</script>

<div
  bind:this={placeholderRef}
  class="relative inline-blockinvisible"
>
  <div class="relative p-4" style="color: {constellationColor};">
    <div
      class="inline-block"
      style="
        width: {calculateConstellationDimensions().width}px;
        height: {calculateConstellationDimensions().height}px;
      "
    ></div>
    {#if cardTitle}
      <div class="text-[2em]">
        {cardTitle}
      </div>
      {#if cardSubtitle}
        <div>
          {cardSubtitle}
        </div>
      {/if}
    {/if}
  </div>
</div>

---

<div
  bind:this={containerRef}
  class="fixed bg-black overflow-hidden"
  style={browser && placeholderBoundingRect ? `
    left: ${isExpanded ? `5%` : `${(placeholderBoundingRect.left || 0)}px`};
    top: ${isExpanded ? `5%` : `${(placeholderBoundingRect.top || 0)}px`};
    width: ${isExpanded ? '90%' : (placeholderBoundingRect.width || 0) + 'px'};
    height: ${isExpanded ? '90%' : (placeholderBoundingRect.height || 0) + 'px'};
    border: 2px solid ${constellationColor};
    box-sizing: border-box;
    z-index: ${currentZIndex};
    transition: left 0.5s ease-in-out, top 0.5s ease-in-out, width 0.5s ease-in-out, height 0.5s ease-in-out, transform 0.25s ease-out, z-index 0.5s ease-in-out;
  ` : ''}
  ontransitionend={handleTransitionEnd}
  onmouseenter={() => { if (!isExpanded) containerRef.style.transform = 'translateY(-10px)'; }}
  onmouseleave={() => { if (!isExpanded) containerRef.style.transform = 'translateY(0px)'; }}
  role="button"
  tabindex="0"
>
  {#if !isExpanded}
    <div
      in:fade={{ duration: 250, delay: 250 }}
      out:fade={{ duration: 250 }}
      role="button"
      tabindex="0"
      onclick={(e) => onclick(e, id)}
      onkeydown={(e) => e.key === 'Enter' && onclick(e, id)}
      class="relative p-4 cursor-pointer w-full h-full"
      style="color: {constellationColor};"
    >
      <canvas bind:this={mainCanvas} class="absolute inset-0 w-full h-full" aria-label="Constellation Canvas"></canvas>

      <div
        class="absolute bottom-5 z-10"
        in:fade={{ duration: 250, delay: 250 }}
        out:fade={{ duration: 250 }}
      >
      {#if cardTitle}
        <div class="text-[2em]">
          {cardTitle}
        </div>
        {#if cardSubtitle}
          <div>
            {cardSubtitle}
          </div>
        {/if}
      {/if}
      </div>
    </div>
  {:else}
    <div
      in:fade={{ duration: 250, delay: 250 }}
      out:fade={{ duration: 250 }}
      role="button"
      tabindex="0"
      onclick={(e) => onclick(e, id)}
      onkeydown={(e) => e.key === 'Enter' && onclick(e, id)}
      class="w-full h-full p-4 text-white flex items-center justify-center"
      style="color: {constellationColor};"
    >
      <p class="text-3xl font-bold">ELATLA (Expanded Content)</p>
    </div>
  {/if}
</div>