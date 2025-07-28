<script lang="ts">
  import { onMount } from 'svelte';
  import { getSvgContent } from '$lib/stores/svgStore'; // Import the store function

  const {
    name,
    size = 16,
    color = 'var(--fg-color)',
    className = '',
  } = $props<{
    name: string;
    size?: number;
    color?: string;
    className?: string;
  }>();

  let rawSvgContent = $state('');
  let styledSvg = $state('');
  let isLoading = $state(true); // Add a loading state

  // Function to fetch SVG content using the store
  async function loadAndProcessSvg() {
    isLoading = true; // Set loading to true
    try {
      rawSvgContent = await getSvgContent(name); // Use the store function
    } finally {
      isLoading = false; // Set loading to false when done
    }
  }

  onMount(() => {
    loadAndProcessSvg();
  });

  // This effect will react to changes in rawSvgContent, size, and color
  $effect(() => {
    // Explicitly prevent DOMParser on SSR
    if (typeof window === 'undefined') {
      // During SSR, if rawSvgContent is not yet available, render a placeholder
      // or an empty string to avoid layout shifts.
      // You could also pre-render a basic SVG here if you have a universal fallback.
      styledSvg = ''; // Or a simple loading SVG: `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="100%" height="100%" fill="lightgray"/></svg>`;
      return;
    }

    if (rawSvgContent) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawSvgContent, 'image/svg+xml');
      const svgElement = doc.documentElement;

      // Ensure the SVG has a viewBox for proper scaling
      if (!svgElement.hasAttribute('viewBox')) {
        const originalWidth = svgElement.getAttribute('width') || '16';
        const originalHeight = svgElement.getAttribute('height') || '16';
        svgElement.setAttribute('viewBox', `0 0 ${originalWidth} ${originalHeight}`);
      }

      // Set the width and height directly on the SVG element
      svgElement.setAttribute('width', size.toString());
      svgElement.setAttribute('height', size.toString());

      // Logic for fill color
      const groupElement = svgElement.querySelector('g');
      if (groupElement) {
        groupElement.setAttribute('fill', color);
      } else {
        svgElement.setAttribute('fill', color);
        svgElement.querySelectorAll('path, rect, circle, polygon, polyline, ellipse')
          .forEach(el => {
            if (!el.hasAttribute('fill')) {
                el.setAttribute('fill', color);
            }
          });
      }

      styledSvg = new XMLSerializer().serializeToString(svgElement);
    } else {
      // If rawSvgContent is not yet loaded on client, render an empty string or a loading spinner
      styledSvg = '';
    }
  });
</script>

<div
  class="inline-block {className}"
  style="width: {size}px; height: {size}px;"
  aria-hidden="true"
>
  {#if isLoading && !styledSvg}
    <!-- Show a loading spinner or placeholder while fetching -->
    <div style="width: {size}px; height: {size}px; display: flex; align-items: center; justify-content: center; background-color: #eee; border-radius: 4px;">
      <svg class="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  {:else}
    {@html styledSvg}
  {/if}
</div>

<style>
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  .h-5 { height: 1.25rem; }
  .w-5 { width: 1.25rem; }
  .text-gray-500 { color: #6b7280; }
  .opacity-25 { opacity: 0.25; }
  .opacity-75 { opacity: 0.75; }
</style>