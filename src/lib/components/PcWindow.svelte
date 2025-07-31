<script lang="ts">
  import { type Snippet, onMount } from 'svelte';
  import { globalZIndex } from '$lib/stores/pcWindowStore';
  import windowControlsImg from '$lib/assets/window_controls.png';

  const {
    name,
    x = 0,
    y = 0,
    class: customClass = '',
    children,
  } = $props<{
    name?: string;
    x?: number;
    y?: number;
    class?: string;
    children: Snippet;
  }>();

  let offsetX = 0;
  let offsetY = 0;
  let posX = $state(x);
  let posY = $state(y);
  let isDragging = $state(false);
  let windowRef: HTMLDivElement;
  let currentZIndex = $state(0);

  function bringToFront() {
    globalZIndex.update(n => {
      const newZ = n + 1;
      currentZIndex = newZ;
      windowRef.style.zIndex = newZ.toString();
      return newZ;
    });
  }

  function startDrag(e: MouseEvent) {
    const rect = windowRef.getBoundingClientRect();
    if (!rect) return;

    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    isDragging = true;
    
    // Bring to front when drag starts
    bringToFront();
    
    document.body.style.userSelect = 'none';
  }

  function onDrag(e: MouseEvent) {
    if (!isDragging || !windowRef) return;
    
    posX = e.clientX - offsetX;
    posY = e.clientY - offsetY;
    
    windowRef.style.left = `${posX}px`;
    windowRef.style.top = `${posY}px`;
  }

  function stopDrag() {
    isDragging = false;
    document.body.style.userSelect = '';
  }

  onMount(() => {
    // Initialize z-index
    bringToFront();
    
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
    
    return () => {
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', stopDrag);
    };
  });
</script>

<div
  bind:this={windowRef}
  role="button"
  tabindex="0"
  class="absolute flex flex-col select-none bg-[var(--bg-color)] text-[var(--fg-color)] {customClass}"
  style="left: {posX}px; top: {posY}px; z-index: {currentZIndex}"
  onclick={bringToFront}
  onkeypress={bringToFront}
>
  <!-- Header -->
  <div 
    role="button"
    tabindex="0"
    class="relative flex flex-row items-center justify-between px-2 border-x-2 border-t-2 border-[var(--fg-color)] min-h-[2em] {isDragging ? 'cursor-grabbing' : 'cursor-grab'}"
    onmousedown={startDrag}
  >
    <span class="{name ? '' : 'invisible'}">■ {name}</span>
    <img
      class="cursor-pointer pixelated h-[18px] w-auto"
      src={windowControlsImg}
      alt="Controls"
    />
  </div>

  <!-- Content -->
  <div class="bg-[var(--bg-color)] text-[var(--fg-color)] border-2 border-b-12 border-[var(--fg-color)] py-2 px-4">
    {@render children?.()}
  </div>
</div>