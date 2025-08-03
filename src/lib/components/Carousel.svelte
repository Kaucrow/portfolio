<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import Icon from './Icon.svelte';

  export type MediaItem = {
    type: 'image' | 'video';
    src: string;
    alt?: string;
    autoplay?: boolean;
    loop?: boolean;
    controls?: boolean;
  };

  const {
    media = [],
    duration = 300,
  } = $props<{
    media: MediaItem[];
    duration?: number;
  }>();

  let currentIndex = $state(0);
  let carouselWidth = $state(0);
  let previewWidth = $state(120);
  let previewContainerWidth = $state(0);
  let isFullscreen = $state(false);

  const translateX = new Tween(0, {
    duration: duration,
    easing: cubicOut
  });

  const previewTranslateX = new Tween(0, {
    duration: duration,
    easing: cubicOut
  });

  $effect(() => {
    if (media.length > 0) {
      translateX.target = -currentIndex * carouselWidth;
      updatePreviewPosition();
    }
  });

  function updatePreviewPosition(): void {
    const centerOffset = previewContainerWidth / 2 - previewWidth / 2;
    const target = currentIndex * previewWidth - centerOffset;
    previewTranslateX.target = -target;
  }

  function next(): void {
    currentIndex = (currentIndex + 1) % media.length;
  }

  function prev(): void {
    currentIndex = (currentIndex - 1 + media.length) % media.length;
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
  }

  function scrollToIndex(index: number): void {
    currentIndex = index;
  }

  function handleFullscreenChange() {
    if (document.fullscreenElement) {
      isFullscreen = true;
    } else {
      isFullscreen = false;
    }
  }

  onMount(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
  });

  onDestroy(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
  });
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="max-w-screen-lg mx-auto mb-4">
  <div
    class="relative overflow-hidden aspect-video flex items-center bg-gray-200 pixel-corners shadow-md mb-4"
    bind:clientWidth={carouselWidth}
  >
    <div
      class="flex h-full transition-transform duration-300 ease-out"
      style="transform: translateX({translateX.current}px);"
    >
      {#each media as item, i}
        <div class="flex-shrink-0 h-full w-full flex justify-center items-center" style="width: {carouselWidth}px;">
          {#if item.type === 'image'}
            <img src={item.src} alt={item.alt || 'Carousel image'} class="w-full h-full object-cover" />
          {:else if item.type === 'video'}
            <video
              src={item.src}
              autoplay={item.autoplay || false}
              loop={item.loop || false}
              controls={item.controls !== false}
              muted={true}
              playsinline={true}
              class="w-full h-full {isFullscreen ? '' : 'object-cover'}"
            >
              Your browser does not support the video tag.
            </video>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>

{#if media.length > 1}
  <div class="flex flex-row mx-10 h-22 mt-4 items-center gap-8">
    <button
      class="flex-shrink-0 w-10 z-10 cursor-pointer bg-black bg-opacity-40 hover:bg-opacity-60 rounded-full h-full flex justify-center items-center text-white text-sm select-none transition-colors duration-200"
      onclick={(e: MouseEvent) => {
        e.stopPropagation();
        prev();
      }}
    >
      <Icon name="arrow-left" size={32} />
    </button>
    <div
      class="flex-grow h-full overflow-hidden"
      bind:clientWidth={previewContainerWidth}
    >
      <div
        class="flex h-full items-center gap-2"
        style="transform: translateX({previewTranslateX.current - 15}px);"
      >
        {#each media as item, i}
          <button
            class="flex-shrink-0 h-20 transition-all duration-200 ease-in-out border-2 {i === currentIndex ? '' : 'border-transparent hover:border-gray-300'} **bg-white**"
            style="width: {previewWidth}px;"
            onclick={(e: MouseEvent) => {
              e.stopPropagation();
              scrollToIndex(i);
            }}
          >
            {#if item.type === 'image'}
              <img
                src={item.src}
                alt={item.alt || 'Preview image'}
                class="w-full h-full object-cover"
              />
            {:else if item.type === 'video'}
              <div class="relative w-full h-full">
                <video
                  src={item.src}
                  muted={true}
                  playsinline={true}
                  class="w-full h-full object-cover"
                ></video>
                <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="white"
                    class="w-6 h-6"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            {/if}
          </button>
        {/each}
      </div>
    </div>
    <button
      class="flex-shrink-0 w-10 z-10 cursor-pointer bg-black bg-opacity-40 hover:bg-opacity-60 rounded-full h-full flex justify-center items-center text-white text-sm select-none transition-colors duration-200"
      onclick={(e: MouseEvent) => {
        e.stopPropagation();
        next();
      }}
    >
      <Icon name="arrow-right" size={32} />
    </button>
  </div>
{/if}

<style>
  .transition-transform {
    transition-property: transform;
  }

  .pixel-corners {
    clip-path: polygon(
      0px calc(100% - 8px),
      4px calc(100% - 8px),
      4px calc(100% - 4px),
      8px calc(100% - 4px),
      8px 100%,
      calc(100% - 8px) 100%,
      calc(100% - 8px) calc(100% - 4px),
      calc(100% - 4px) calc(100% - 4px),
      calc(100% - 4px) calc(100% - 8px),
      100% calc(100% - 8px),
      100% 8px,
      calc(100% - 4px) 8px,
      calc(100% - 4px) 4px,
      calc(100% - 8px) 4px,
      calc(100% - 8px) 0px,
      8px 0px,
      8px 4px,
      4px 4px,
      4px 8px,
      0px 8px
    );
  }
</style>