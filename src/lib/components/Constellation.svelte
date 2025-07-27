<script lang="ts">
  import { onMount, onDestroy, afterUpdate } from 'svelte';
  import { browser } from '$app/environment';
  import { fade } from 'svelte/transition';

  import { Line } from '$lib/engine/Line';
  import { Camera } from '$lib/engine/Camera.svelte';

  interface Star {
    id: number;
    x: number;
    y: number;
  }

  export let id: number | undefined = undefined;
  export let stars: Star[] = [];
  export let connections: [number, number][] = [];
  export let constellationColor: string = '#fff1e8';
  export let starSize: number = 10;
  export let cardTitle: string = '';
  export let cardSubtitle: string = '';

  let containerRef: HTMLDivElement;
  let placeholderRef: HTMLDivElement;

  let placeholderBoundingRect: DOMRect;
  let initialBoundingRectSet: boolean = false;

  export let isExpanded: boolean = false;
  let currentZIndex: number = 1; // Start with a default z-index (e.g., 1)

  let placeholderCanvas: HTMLCanvasElement;
  let mainCanvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let camera: Camera | null = null;
  let canvasWidth: number = 0;
  let canvasHeight: number = 0;

  let mainCanvasMounted: boolean = false;


  function calculateConstellationDimensions() {
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
    const minSize = 100;
    return {
      width: Math.max(minSize, maxX + starSize * 2),
      height: Math.max(minSize, maxY + starSize * 2)
    };
  }

  function resizeAndDrawCanvas(canvasEl: HTMLCanvasElement): void {
    if (!browser || !canvasEl) return;

    const { width, height } = calculateConstellationDimensions();

    canvasEl.width = width;
    canvasEl.height = height;
    canvasEl.style.width = width + 'px';
    canvasEl.style.height = height + 'px';

    canvasWidth = width;
    canvasHeight = height;

    if (canvasEl === mainCanvas) {
      ctx = mainCanvas.getContext('2d');
      camera = new Camera(canvasWidth, canvasHeight);
    }
  }

  export let onclick: (event: MouseEvent | KeyboardEvent, constellationId: number | undefined) => void = (event, constellationId) => {
    if (browser) {
      if (event && (event.type === 'keydown' || event.type === 'keypress')) {
        event.preventDefault();
      }
      console.log(`Clicked on constellation ${constellationId}`);
      isExpanded = !isExpanded;
    }
  };

  function drawConstellation(): void {
    if (!ctx || !browser || isExpanded) {
      return;
    }

    if (ctx.canvas !== mainCanvas) {
        if (mainCanvas) {
            ctx = mainCanvas.getContext('2d');
            if (!ctx) return;
        } else {
            return;
        }
    }

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = constellationColor;
    ctx.fillStyle = constellationColor;

    const starPositions = new Map<number, Star>();
    stars.forEach(star => {
      starPositions.set(star.id, star);
    });

    connections.forEach(connection => {
      const [startId, endId] = connection;
      const startStar = starPositions.get(startId);
      const endStar = starPositions.get(endId);

      if (startStar && endStar && ctx && camera) {
        const fromPos = camera.htmlToScreen(startStar.x, startStar.y);
        const toPos = camera.htmlToScreen(endStar.x, endStar.y);

        const line = new Line(constellationColor, 1);
        line.from = { x: fromPos.x, y: fromPos.y };
        line.to = { x: toPos.x, y: toPos.y };
        line.draw(ctx, camera, 0, 0);
      }
    });

    stars.forEach(star => {
      const x = star.x - starSize / 2;
      const y = star.y - starSize / 2;

      if (!ctx) return;

      ctx.fillRect(x, y, starSize, starSize);

      ctx.font = `${starSize * 1.5}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(star.id.toString(), star.x + starSize, star.y + starSize);
    });
  }


  onMount(() => {
    if (browser) {
      placeholderBoundingRect = new DOMRect();

      const pollForInitialSize = () => {
        if (placeholderRef && placeholderCanvas) {
          resizeAndDrawCanvas(placeholderCanvas);

          const rect = placeholderRef.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            placeholderBoundingRect = rect;
            initialBoundingRectSet = true;
            console.log(`Constellation ${id}: Initial placeholderBoundingRect resolved!`, placeholderBoundingRect);
            return;
          }
        }
        requestAnimationFrame(pollForInitialSize);
      };

      pollForInitialSize();

      const handleResize = () => {
        if (placeholderCanvas) resizeAndDrawCanvas(placeholderCanvas);
        if (mainCanvas) resizeAndDrawCanvas(mainCanvas);
        if (placeholderRef) {
          placeholderBoundingRect = placeholderRef.getBoundingClientRect();
          console.log(`Constellation ${id}: placeholderBoundingRect updated on resize!`, placeholderBoundingRect);
        }
      };
      window.addEventListener('resize', handleResize);

      onDestroy(() => {
        window.removeEventListener('resize', handleResize);
      });
    }
  });


  $: if (mainCanvas && browser && !mainCanvasMounted) {
    mainCanvasMounted = true;
    console.log(`Constellation ${id}: Main canvas appeared in DOM.`);
    resizeAndDrawCanvas(mainCanvas);
    if (ctx && camera) {
      drawConstellation();
    }
  } else if (!mainCanvas && browser && mainCanvasMounted) {
    mainCanvasMounted = false;
    console.log(`Constellation ${id}: Main canvas disappeared from DOM.`);
    ctx = null;
    camera = null;
  }

    // React to changes in isExpanded to control z-index
    $: {
        if (isExpanded) {
            currentZIndex = 50; // Set high z-index when expanded
        }
    }


  afterUpdate(() => {
    if (browser && placeholderRef && !isExpanded && !initialBoundingRectSet) {
      const currentRect = placeholderRef.getBoundingClientRect();

      if (currentRect.width > 0 && currentRect.height > 0 &&
        (placeholderBoundingRect.width !== currentRect.width ||
        placeholderBoundingRect.height !== currentRect.height ||
        placeholderBoundingRect.left !== currentRect.left ||
        placeholderBoundingRect.top !== currentRect.top))
      {
        placeholderBoundingRect = currentRect;
        console.log(`Constellation ${id}: placeholderBoundingRect updated (afterUpdate, collapsed state):`, placeholderBoundingRect);
      }
    }

    if (browser && !isExpanded && ctx && camera && mainCanvasMounted && mainCanvas) {
      resizeAndDrawCanvas(mainCanvas);
      drawConstellation();
    }
  });


  $: stars, connections, constellationColor, starSize;
  $: cardTitle, cardSubtitle;

    // Function to handle the end of the transition
    function handleTransitionEnd() {
        if (!isExpanded) {
            currentZIndex = 1; // Revert z-index when collapse transition is complete
        }
    }
</script>

<div
  bind:this={placeholderRef}
  class="inline-block pointer-events-none"
  style="opacity: 0;
          position: relative;
          z-index: -1;
         "
>
  <div
    class="relative p-2"
    style="color: {constellationColor};"
  >
    <canvas bind:this={placeholderCanvas} aria-label="Constellation Placeholder Canvas"></canvas>
    {#if cardTitle}
      <div class="text-[2em]">
        {cardTitle}
      </div>
    {/if}
  </div>
</div>

---

<div
  bind:this={containerRef}
  class="fixed transition-all duration-500 ease-in-out bg-black overflow-hidden"
  style={browser && placeholderBoundingRect ? `
    left: ${isExpanded ? `5%` : `${(placeholderBoundingRect.left || 0)}px`};
    top: ${isExpanded ? `5%` : `${(placeholderBoundingRect.top || 0)}px`};
    width: ${isExpanded ? '90%' : (placeholderBoundingRect.width || 0) + 'px'};
    height: ${isExpanded ? '90%' : (placeholderBoundingRect.height || 0) + 'px'};
    border: 2px solid ${constellationColor};
    box-sizing: border-box;
    z-index: ${currentZIndex}; /* Use the dynamic z-index */
  ` : ''}
  ontransitionend={handleTransitionEnd}
  onmouseenter={ () => { if (!isExpanded) containerRef.style.transform = 'translateY(-10px)'; }}
  onmouseleave={ () => { if (!isExpanded) containerRef.style.transform = 'translateY(0px)'; }}
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
      class="relative p-2 cursor-pointer w-full h-full" style="color: {constellationColor};"
    >
      <canvas bind:this={mainCanvas} class="w-full h-full" aria-label="Constellation Canvas"></canvas>
      {#if cardTitle}
        <div class="text-[2em]">
          {cardTitle}
        </div>
      {/if}
    </div>
  {:else}
    <div
      in:fade={{ duration: 250, delay: 250 }}
      out:fade={{ duration: 250 }}
      role="button"
      tabindex="0"
      onclick={(e) => onclick(e, id)}
      onkeydown={(e) => e.key === 'Enter' && onclick(e, id)}
      class="w-full h-full p-4 text-white" style="color: {constellationColor};"
    >
      ELATLA (Expanded Content)
    </div>
  {/if}
</div>