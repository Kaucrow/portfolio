<script lang="ts">
  import { type Snippet, onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { fade } from 'svelte/transition';

  const {
    class: customClass = '',
    scrollTrackColor = 'var(--bg-color)',
    scrollThumbColor = 'var(--fg-color)',
    scrollbarWidth = '1em',
    children,
  } = $props<{
    class?: string;
    scrollTrackColor?: string;
    scrollThumbColor?: string;
    scrollbarWidth?: string;
    children: Snippet;
  }>();

  let contentRef: HTMLDivElement; // Reference to the scrollable content div
  let scrollTrackRef = $state<HTMLDivElement | undefined>(undefined); // Initialize as undefined
  let scrollThumbRef = $state<HTMLDivElement | undefined>(undefined); // Reference to the scroll thumb div

  // ARIA attributes
  let contentId = 'scrollable-content-' + Math.random().toString(36).substring(2, 9); // Unique ID for aria-controls
  let ariaValueNow = $state(0);
  const ariaValueMin = 0;
  const ariaValueMax = 100;

  let showCustomScrollbar = $state(false);
  let scrollThumbHeight = $state(0);
  let scrollThumbTop = $state(0);

  // New state for drag functionality
  let isDragging = $state(false);
  let startY = $state(0); // Mouse Y position when drag starts
  let startScrollTop = $state(0); // Content scrollTop when drag starts

  let resizeObserver: ResizeObserver | null = null;
  let mutationObserver: MutationObserver | null = null;

  function updateScrollbar() {
    if (!contentRef) return;

    const { scrollHeight, clientHeight, scrollTop } = contentRef;

    // Determine if content overflows vertically
    const overflows = scrollHeight > clientHeight;
    showCustomScrollbar = overflows;

    // Only update thumb properties if scrollTrackRef is available and overflows
    if (overflows && scrollTrackRef) {
      const trackHeight = scrollTrackRef.clientHeight;

      scrollThumbHeight = Math.max(
        (clientHeight / scrollHeight) * trackHeight,
        20 // Minimum thumb height
      );

      // Ensure scrollThumbTop is within bounds
      const maxThumbTop = trackHeight - scrollThumbHeight;
      scrollThumbTop = Math.min(
        Math.max(0, (scrollTop / scrollHeight) * trackHeight),
        maxThumbTop
      );

      // Calculate ariaValueNow as a percentage of scroll progress
      ariaValueNow = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
      if (isNaN(ariaValueNow)) ariaValueNow = 0; // Handle case where scrollHeight - clientHeight is 0
    } else if (!overflows) {
      // If no overflow, reset thumb values and hide custom scrollbar
      scrollThumbHeight = 0;
      scrollThumbTop = 0;
      ariaValueNow = 0;
    }
  }

  function handleScroll() {
    if (!contentRef || !scrollTrackRef) return;
    const { scrollHeight, clientHeight, scrollTop } = contentRef; // Destructure clientHeight here
    const trackHeight = scrollTrackRef.clientHeight;

    // Ensure scrollThumbTop is within bounds when scrolling
    const maxThumbTop = trackHeight - scrollThumbHeight;
    scrollThumbTop = Math.min(
      Math.max(0, (scrollTop / scrollHeight) * trackHeight),
      maxThumbTop
    );

    // Update ariaValueNow on scroll
    ariaValueNow = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
    if (isNaN(ariaValueNow)) ariaValueNow = 0;
  }

  // --- Drag functionality ---
  function handleThumbMouseDown(event: MouseEvent) {
    if (!scrollThumbRef || !contentRef || !scrollTrackRef) return;

    isDragging = true;
    startY = event.clientY;
    startScrollTop = contentRef.scrollTop;

    // Add event listeners to window to capture mousemove and mouseup globally
    window.addEventListener('mousemove', handleThumbMouseMove);
    window.addEventListener('mouseup', handleThumbMouseUp);
    // Prevent default behavior to avoid text selection during drag
    event.preventDefault();
  }

  function handleThumbMouseMove(event: MouseEvent) {
    if (!isDragging || !contentRef || !scrollTrackRef) return;

    const deltaY = event.clientY - startY;
    const trackHeight = scrollTrackRef.clientHeight;
    const { scrollHeight, clientHeight } = contentRef;

    // Calculate the new scroll position based on thumb movement
    const scrollRatio = scrollHeight / trackHeight;
    const newScrollTop = startScrollTop + deltaY * scrollRatio;

    // Apply the new scroll position to the content
    contentRef.scrollTop = newScrollTop;
  }

  function handleThumbMouseUp() {
    isDragging = false;
    window.removeEventListener('mousemove', handleThumbMouseMove);
    window.removeEventListener('mouseup', handleThumbMouseUp);
  }

  function handleTrackClick(event: MouseEvent) {
    if (!scrollTrackRef || !contentRef || !scrollThumbRef) return;

    // Check if the click was directly on the track, not the thumb itself
    if (event.target === scrollTrackRef) {
      const trackRect = scrollTrackRef.getBoundingClientRect();
      const clickY = event.clientY - trackRect.top; // Y position relative to the track

      // Calculate thumb's current center
      const thumbCenter = scrollThumbTop + scrollThumbHeight / 2;

      const { scrollHeight, clientHeight } = contentRef;
      const trackHeight = scrollTrackRef.clientHeight;

      let newScrollTop: number;
      // Scroll by a percentage of visible height
      const scrollAmount = clientHeight * 0.9;

      if (clickY < thumbCenter) {
        // Clicked above the thumb, scroll up
        newScrollTop = contentRef.scrollTop - scrollAmount;
      } else {
        // Clicked below the thumb, scroll down
        newScrollTop = contentRef.scrollTop + scrollAmount;
      }

      // Ensure newScrollTop is within bounds
      newScrollTop = Math.max(0, Math.min(newScrollTop, scrollHeight - clientHeight));

      // Apply the new scroll position
      contentRef.scrollTop = newScrollTop;
    }
  }

  onMount(() => {
    if (!browser) return;

    // Listen for scroll events on the content
    contentRef.addEventListener('scroll', handleScroll);

    // Observe contentRef for size changes (e.g., window resize, flex container changes)
    resizeObserver = new ResizeObserver(() => {
      updateScrollbar();
    });
    resizeObserver.observe(contentRef);

    // Observe contentRef's children for content changes
    mutationObserver = new MutationObserver(() => {
      updateScrollbar();
    });
    // Configure the observer to watch for changes to the children and their subtree
    mutationObserver.observe(contentRef, { childList: true, subtree: true, characterData: true });

    // Initial update.
    updateScrollbar();
  });

  // Use a reactive statement to react to changes in showCustomScrollbar and scrollTrackRef
  $effect(() => {
    // This effect ensures updateScrollbar is called whenever the visibility of the custom scrollbar
    // or the track/thumb references become available/change.
    // It's crucial for correct initial rendering and dynamic content.
    if (showCustomScrollbar && scrollTrackRef && scrollThumbRef) {
      updateScrollbar();
    }
  });

  onDestroy(() => {
    if (!browser) return;
    contentRef.removeEventListener('scroll', handleScroll);
    if (resizeObserver) resizeObserver.disconnect();
    if (mutationObserver) mutationObserver.disconnect();
    window.removeEventListener('mousemove', handleThumbMouseMove);
    window.removeEventListener('mouseup', handleThumbMouseUp);
  });
</script>

<div class="relative h-full w-full flex flex-col {customClass}">
  <div bind:this={contentRef} class="hide-scrollbar overflow-y-auto h-full w-full">
    {@render children?.()}
  </div>

  {#if showCustomScrollbar}
    <div
      bind:this={scrollTrackRef}
      role="scrollbar"
      aria-controls={contentId}
      aria-valuenow={ariaValueNow}
      aria-valuemin={ariaValueMin}
      aria-valuemax={ariaValueMax}
      tabindex="0"
      class="absolute top-2 bottom-2 rounded-full inset-y-2 right-2"
      style="
        width: {scrollbarWidth};
        background-color: {scrollTrackColor};
      "
      onmousedown={handleTrackClick}
      in:fade={{ duration: 250, delay: 250 }}
      out:fade={{ duration: 250 }}
    >
      <div
        bind:this={scrollThumbRef}
        class="absolute left-1/2 -translate-x-1/2 w-3/5 rounded-full cursor-grab"
        role="cell"
        tabindex="0"
        class:grabbing={isDragging}
        style="
          height: {scrollThumbHeight}px;
          top: {scrollThumbTop}px;
          background-color: {scrollThumbColor};
        "
        onmousedown={handleThumbMouseDown}
      ></div>
    </div>
  {/if}
</div>

<style>
  .hide-scrollbar {
    /* For WebKit browsers (Chrome, Safari) */
    &::-webkit-scrollbar {
      width: 0;
      height: 0;
      background: transparent;
    }
    /* For Firefox */
    scrollbar-width: none;
    /* For IE/Edge */
    -ms-overflow-style: none;
  }

  .cursor-grab {
    cursor: grab;
  }

  .cursor-grab.grabbing {
    cursor: grabbing;
  }
</style>