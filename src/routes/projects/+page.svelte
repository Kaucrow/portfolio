<script lang="ts">
  import { useScene } from "$lib/engine/Scene.svelte";

  const { sceneState, addRoomObject, beginSceneTransition } = useScene();

  import { Transition } from "$lib/engine/Transition";
  
  import Constellation from "$lib/components/Constellation.svelte";
  import StarsBackground from "$lib/components/StarsBackground.svelte";

  let pageObjectsInitialized = false;

  let displayProject = $state(false);

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

  function handleConstellationClick(event: MouseEvent | KeyboardEvent, id: number | undefined) {
    console.log(`Clicked on constellation ${id}`);
    displayProject = true;
  }
</script>

<div class="flex gap-0 items-center justify-center w-full min-h-100">
  <StarsBackground/>

  <Constellation
    id={1}
    stars={starsData}
    connections={connectionsData}
    cardTitle="elatla"
    cardSubtitle="gigachad unparalleled"
  />

  <Constellation
    id={1}
    stars={starsData}
    connections={connectionsData}
    cardTitle="elatla"
    cardSubtitle="gigachad unparalleled"
  />
</div>