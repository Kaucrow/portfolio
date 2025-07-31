<script lang="ts">
  import { type Snippet, onMount } from 'svelte';
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
  let posX = $state(0);
  let posY = $state(0);
  let isDragging = $state(false);

  function startDrag(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    isDragging = true;
    
    // Store initial position
    posX = rect.left;
    posY = rect.top;
    
    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
  }

  function onDrag(e: MouseEvent) {
    if (!isDragging) return;
    
    posX = e.clientX - offsetX;
    posY = e.clientY - offsetY;
    
    // Update window position
    const windowEl = document.querySelector('.pc-window') as HTMLElement;
    if (windowEl) {
      windowEl.style.left = `${posX}px`;
      windowEl.style.top = `${posY}px`;
    }
  }

  function stopDrag() {
    isDragging = false;
    document.body.style.userSelect = '';
  }

  onMount(() => {
    posX = x;
    posY = y;

    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
    
    return () => {
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', stopDrag);
    };
  });
</script>

<!-- Main Container -->
<div 
  class="pc-window absolute flex flex-col select-none bg-[var(--bg-color)] text-[var(--fg-color)] z-10 {customClass}"
  style="left: {posX}px; top: {posY}px;"
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
  <div class="bg-[var(--bg-color)] text-[var(--fg-color)] border-2 border-b-12 border-[var(--fg-color)] text-[1.5em] py-2 px-4">
    {@render children?.()}
  </div>
</div>