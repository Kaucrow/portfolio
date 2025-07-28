<script lang="ts">
  import { useScene } from "$lib/engine/Scene.svelte";

  const { sceneState, addRoomObject, beginSceneTransition } = useScene();

  import { Transition } from "$lib/engine/Transition";
  
  import Constellation from "$lib/components/Constellation.svelte";
  import StarsBackground from "$lib/components/StarsBackground.svelte";
  import { type MediaItem } from "$lib/components/Carousel.svelte";

  let pageObjectsInitialized = false;

  const starsData = [
    { id: 0, x: 100, y: 50 },
    { id: 1, x: 250, y: 150 },
    { id: 2, x: 150, y: 250 },
    { id: 3, x: 300, y: 300 },
    { id: 4, x: 50, y: 200 },
    { id: 5, x: 350, y: 100 },
  ];

  // Example connections: pairs of star IDs to draw lines between
  const connectionsData: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 0],
    [4, 2],
    [5, 1],
    [5, 3],
  ];

  const mediaItems: MediaItem[] = [
    { type: 'image', src: 'https://placehold.co/600x400?text=Hello+World', alt: 'Placeholder Image 1' },
    { type: 'video', src: 'https://www.w3schools.com/html/mov_bbb.mp4', autoplay: true, loop: true, controls: true },
    { type: 'image', src: 'https://via.placeholder.com/1280x720/33FF57/FFFFFF?text=Image+2', alt: 'Placeholder Image 2' },
    { type: 'video', src: 'https://www.w3schools.com/html/movie.mp4', autoplay: false, loop: false, controls: true },
    { type: 'image', src: 'https://via.placeholder.com/1280x720/3357FF/FFFFFF?text=Image+3', alt: 'Placeholder Image 3' },
  ];

  $effect(() => {
      if (
        !sceneState.isInitialized ||
        !sceneState.room ||
        !sceneState.camera ||
        sceneState.camera.globalScale === 0 ||
        pageObjectsInitialized)
      {
        return;
      }

      pageObjectsInitialized = true;

      (async () => {
        if (!sceneState.camera || !sceneState.room) return;

        sceneState.room.clearObjects();
        sceneState.room.clearTransition();

        beginSceneTransition(
            new Transition('fromLeft', sceneState.camera, () => {
          })
        );
      })();
    }
  );
</script>

<div class="flex gap-0 items-center justify-center w-full min-h-100">
  <StarsBackground/>

  <Constellation
    id={1}
    stars={starsData}
    connections={connectionsData}
    title="Soundown"
    cardSubtitle="Music Player Web App"
    cardTechnologies={['React', 'Shadcn']}
    subtitle="Sleek music player web app built using React, IndexedDB, and Shadcn components."
    githubLink="https://github.com/Kaucrow/soundown"
    status="completed"
    mediaItems={mediaItems}
  />
</div>