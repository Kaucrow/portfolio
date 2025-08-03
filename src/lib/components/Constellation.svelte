<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { fade } from 'svelte/transition';
  import { marked } from 'marked';

  import { Line } from '$lib/engine/Line';
  import { Camera } from '$lib/engine/Camera.svelte';
  
  import ScrollArea from './ScrollArea.svelte';
  import Carousel, { type MediaItem } from './Carousel.svelte';
  import Icon from './Icon.svelte';
  import Badge from './Badge.svelte';

  export interface Star {
    id: number;
    x: number;
    y: number;
  }

  export type StarConnection = [number, number];

  const {
    id,
    stars,
    connections,
    constellationColor = '#fff1e8',
    starSize = 10,
    title,
    cardSubtitle,
    cardTechnologies,
    subtitle,
    githubLink,
    status,
    mediaItems = [],
    description,
    features = [],
    technologies = [],
  } = $props<{
    id: number | undefined;
    stars: Star[];
    connections: StarConnection[];
    constellationColor?: string;
    starSize?: number;
    title: string;
    cardSubtitle: string;
    cardTechnologies: string[];
    subtitle: string;
    githubLink: string;
    status: 'completed' | 'ongoing';
    mediaItems: MediaItem[];
    description: string;
    features?: string[];
    technologies?: string[];
  }>();

  const technologyMap: { [key: string]: { name: string, icon: string }} = {
    shadcn: { name: 'Shadcn', icon: 'shadcn' },
    react: { name: 'React', icon: 'react' },
    typescript: { name: 'TypeScript', icon: 'typescript' },
    indexeddb: { name: 'IndexedDB', icon: 'database' },
    firebase: { name: 'Firebase', icon: '' },
    cpp: { name: 'C++', icon: '' },
    opengl: { name: 'OpenGL', icon: '' },
    rust: { name: 'Rust', icon: '' },
  };

  let renderedDescriptionHtml = $state('');

  let containerRef: HTMLDivElement;
  let placeholderRef: HTMLDivElement;

  let scrollY = $state(0);

  let placeholderBoundingRect = $state<DOMRect>();
  let isExpanded = $state(false);
  let shouldTransitionTop = $state(false);
  let currentZIndex = $state(10); // Start with a default z-index

  let displayCarousel = $state(false);

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
      if (isExpanded) shouldTransitionTop = true;
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

    connections.forEach((connection: StarConnection) => {
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
      (async () => {
        renderedDescriptionHtml = await marked(description);
      })();

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

      const handleScroll = () => {
        scrollY = window.scrollY;
      };
      window.addEventListener('scroll', handleScroll);

      onDestroy(() => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll);
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

      const descriptionDiv = document.getElementById('description-div');
      if (descriptionDiv) {
        descriptionDiv.innerHTML = renderedDescriptionHtml;
      } else {
        console.warn("Could not find description div.");
      }
    }
  });

  // Function to handle the end of the transition
  async function ontransitionend(e: TransitionEvent) {
    if (e.propertyName === 'width') {
      if (!isExpanded) {
        currentZIndex = 10; // Revert z-index when collapse transition is complete
        displayCarousel = false;
        shouldTransitionTop = false;
      } else {
        displayCarousel = true;
      }
    }
  }
  
  function onmouseenter() {
    if (!isExpanded) {
      containerRef.style.transform = 'translateY(-10px)';
    }
  }
  
  function onmouseleave() {
    if (!isExpanded) {
      containerRef.style.transform = 'translateY(0px)';
    }
  }
</script>

<div
  bind:this={placeholderRef}
  class="static inline-block invisible"
>
  <div class="relative p-4" style="color: {constellationColor};">
    <div
      class="inline-block"
      style="
        width: {calculateConstellationDimensions().width}px;
        height: {calculateConstellationDimensions().height}px;
      "
    ></div>
    <div class="text-[2em]">
      {title}
    </div>
    <div>
      {cardSubtitle}
    </div>
  </div>
</div>

<div
  bind:this={containerRef}
  class="fixed bg-[var(--bg-color)] overflow-hidden select-none"
  style={browser && placeholderBoundingRect ? `
    left: ${isExpanded ? `15%` : `${(placeholderBoundingRect.left || 0)}px`};
    top: ${isExpanded
      ? `5%`
      : `${(placeholderBoundingRect.top - scrollY || 0)}px`
    };
    width: ${isExpanded ? '70%' : (placeholderBoundingRect.width || 0) + 'px'};
    height: ${isExpanded ? '90%' : (placeholderBoundingRect.height || 0) + 'px'};
    border: 2px solid ${constellationColor};
    box-sizing: border-box;
    z-index: ${currentZIndex};
    transition: ${shouldTransitionTop ? 'top 0.5s ease-in-out,' : ''} left 0.5s ease-in-out, width 0.5s ease-in-out, height 0.5s ease-in-out, transform 0.25s ease-out;
  ` : ''}
  {ontransitionend}
  {onmouseenter}
  {onmouseleave}
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
      class="relative cursor-pointer w-full h-full"
      style="color: {constellationColor};"
    >
      <canvas bind:this={mainCanvas} class="absolute inset-0 w-full h-full" aria-label="Constellation Canvas"></canvas>

      <div
        class="absolute bottom-0 p-4 z-10 justify-center items-center flex flex-row gap-4 w-full"
        in:fade={{ duration: 250, delay: 250 }}
        out:fade={{ duration: 250 }}
      >
        <div class="flex flex-col w-3/5">
          <div class="text-[3em] leading-none">
            {title}
          </div>
            <div class="text-[1.5em]">
              {cardSubtitle}
            </div>
        </div>
        {#if cardTechnologies}
          <div class="w-2/5 flex flex-wrap gap-2">
            {#each cardTechnologies as technology}
              <Badge name={technology} />
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <ScrollArea>
      <div
        in:fade={{ duration: 250, delay: 250 }}
        out:fade={{ duration: 250 }}
        role="button"
        tabindex="0"
        onclick={(e) => onclick(e, id)}
        onkeydown={(e) => e.key === 'Enter' && onclick(e, id)}
        class="px-8 py-4 pb-8 w-full text-[var(--fg-color)]"
        style="color: {constellationColor};"
      >
        <div class="leading-none mb-2">
          <span class="text-[4em] font-bold">{title}</span>
        </div>
        <div class="flex flex-row gap-4 items-center leading-none mb-2">
          <a href="{githubLink}" onclick={ (e) => { e.stopPropagation(); }}>
            <Badge name="Github" icon="github" />
          </a>
          {#if status === 'completed'}
            <Badge name="Completed" icon="checkmark" />
          {:else}
            <Badge name="Ongoing" />
          {/if}
        </div>
        <div class="text-[1.5em]">
          {subtitle}
        </div>
        {#if displayCarousel}
          <div 
            in:fade={{ duration: 250 }}
            class="mx-30 my-10"
          >
            <Carousel media={mediaItems} />
          </div>
        {:else}
          <div class="h-142"></div>
        {/if}
        <div class="
          min-w-full text-center
          prose prose-invert
          prose-h1:text-[3em] prose-h1:mb-0 prose-h1:mt-0
          prose-h2:text-[2em] prose-h2:mb-0 prose-h2:mt-0
          prose-p:text-[1.5em] prose-p:text-[var(--fg-color)] prose-p:mb-0 prose-p:mt-0 prose-p:leading-8                                     /* Paragraphs */
          prose-ul:mt-0 prose-ul:mb-0 prose-ul:text-[var(--fg-color)]                 /* Lists */
          prose-li:text-[1em] prose-li:mb-0 prose-li:mt-0                                    /* List items */
          "
          id="description-div">
        </div>
        {#if technologies}
          <div class="text-[3em] font-bold">
            Technologies
          </div>
          <div class="flex flex-row gap-4">
            {#each technologies as technology}
              {#if technologyMap[technology].icon}
                <Badge
                  name={technologyMap[technology].name}
                  icon={technologyMap[technology].icon}
                />
              {:else}
                <Badge
                  name={technologyMap[technology].name}
                />
              {/if}
            {/each}  
          </div>
        {/if}
        {#if features}
          <div class="text-[3em] font-bold">
            Features
          </div>
          <div class="flex flex-col gap-4">
            {#each features as feature}
              <div class="flex flex-row gap-2 items-center">
                <Icon className="ml-[-0.25em]" name="triangle-right-sm" size={16}/>
                <span class="text-[1.5em] leading-none">{feature}</span>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </ScrollArea>
  {/if}
</div>