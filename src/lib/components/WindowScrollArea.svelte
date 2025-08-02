<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';

  const {
    class: customClass = '',
    scrollTrackColor = 'var(--bg-color)',
    scrollThumbColor = 'var(--fg-color)',
    scrollbarWidth = '1em',
  } = $props<{
    class?: string;
    scrollTrackColor?: string;
    scrollThumbColor?: string;
    scrollbarWidth?: string;
  }>();

  let scrollTrackRef = $state<HTMLDivElement | undefined>(undefined);
  let scrollThumbRef = $state<HTMLDivElement | undefined>(undefined);

  // Scroll state
  let showCustomScrollbar = $state(false);
  let scrollThumbHeight = $state(0);
  let scrollThumbTop = $state(0);
  let isDragging = $state(false);
  let startY = $state(0);
  let startScrollTop = $state(0);

  // ARIA attributes
  let contentId = 'scrollable-content-' + Math.random().toString(36).substring(2, 9); // Unique ID for aria-controls
  let ariaValueNow = $state(0);
  const ariaValueMin = 0;
  const ariaValueMax = 100;

  function updateScrollbar() {
    if (!browser) return;

    const scrollHeight = document.body.scrollHeight;
    const clientHeight = window.innerHeight;
    const scrollTop = window.scrollY;

    // Show scrollbar only if content overflows
    showCustomScrollbar = scrollHeight > clientHeight;

    if (showCustomScrollbar && scrollTrackRef) {
      const trackHeight = scrollTrackRef.clientHeight;
      
      // Calculate thumb height (minimum 20px)
      scrollThumbHeight = Math.max(
        (clientHeight / scrollHeight) * trackHeight,
        20
      );

      // Calculate thumb position (clamped to track bounds)
      const maxThumbTop = trackHeight - scrollThumbHeight;
      scrollThumbTop = Math.min(
        Math.max(0, (scrollTop / scrollHeight) * trackHeight),
        maxThumbTop
      );

      // Update ARIA value (0-100)
      ariaValueNow = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
    }
  }

  function handleWindowScroll() {
    updateScrollbar();
  }

  function handleResize() {
    updateScrollbar();
  }

  // --- Drag functionality ---
  function handleThumbMouseDown(event: MouseEvent) {
    isDragging = true;
    startY = event.clientY;
    startScrollTop = window.scrollY;

    window.addEventListener('mousemove', handleThumbMouseMove);
    window.addEventListener('mouseup', handleThumbMouseUp);
    event.preventDefault();
  }

  function handleThumbMouseMove(event: MouseEvent) {
    if (!isDragging || !scrollTrackRef) return;

    const deltaY = event.clientY - startY;
    const trackHeight = scrollTrackRef.clientHeight;
    const scrollHeight = document.body.scrollHeight;

    // Calculate new scroll position
    const scrollRatio = scrollHeight / trackHeight;
    const newScrollTop = startScrollTop + deltaY * scrollRatio;

    // Scroll the window
    window.scrollTo(0, newScrollTop);
  }

  function handleThumbMouseUp() {
    isDragging = false;
    window.removeEventListener('mousemove', handleThumbMouseMove);
    window.removeEventListener('mouseup', handleThumbMouseUp);
  }

  function handleTrackClick(event: MouseEvent) {
    if (!scrollTrackRef || event.target !== scrollTrackRef) return;

    const trackRect = scrollTrackRef.getBoundingClientRect();
    const clickY = event.clientY - trackRect.top;
    const thumbCenter = scrollThumbTop + scrollThumbHeight / 2;

    const scrollAmount = window.innerHeight * 0.9;
    const newScrollTop = window.scrollY + (clickY < thumbCenter ? -scrollAmount : scrollAmount);

    window.scrollTo({
      top: Math.max(0, Math.min(newScrollTop, document.body.scrollHeight - window.innerHeight)),
      behavior: 'smooth'
    });
  }

  onMount(() => {
    if (!browser) return;

    window.addEventListener('scroll', handleWindowScroll);
    window.addEventListener('resize', handleResize);

    // Initial setup
    updateScrollbar();

    // Check periodically in case content loads async
    const interval = setInterval(updateScrollbar, 100);
    onDestroy(() => clearInterval(interval));
  });

  onDestroy(() => {
    if (!browser) return;
    window.removeEventListener('scroll', handleWindowScroll);
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('mousemove', handleThumbMouseMove);
    window.removeEventListener('mouseup', handleThumbMouseUp);
  });
</script>

<div class="fixed h-full w-full {customClass}">
  {#if showCustomScrollbar}
    <div
      bind:this={scrollTrackRef}
      role="scrollbar"
      tabindex="0"
      aria-controls={contentId}
      aria-valuenow={ariaValueNow}
      aria-valuemin={ariaValueMin}
      aria-valuemax={ariaValueMax}
      class="absolute top-2 bottom-2 rounded-full right-2"
      style="
        width: {scrollbarWidth};
        background-color: {scrollTrackColor};
      "
      onmousedown={handleTrackClick}
    >
      <div
        bind:this={scrollThumbRef}
        role="cell"
        tabindex="0"
        class="absolute left-1/2 -translate-x-1/2 w-3/5 rounded-full cursor-grab"
        class:grabbing={isDragging}
        style="
          height: {scrollThumbHeight}px;
          top: {scrollThumbTop}px;
          background-color: {scrollThumbColor};
        "
        onmousedown={handleThumbMouseDown}
      >
      </div>
    </div>
  {/if}
</div>

<style>
  :root {
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
  .grabbing {
    cursor: grabbing;
  }
</style>