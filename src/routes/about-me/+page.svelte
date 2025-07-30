<script lang="ts">
  import { useScene } from "$lib/engine/Scene.svelte";

  const { sceneState, addRoomObject, beginSceneTransition } = useScene();

  import { Transition } from "$lib/engine/Transition";

  import Terminal from "$lib/components/Terminal.svelte";

  let pageObjectsInitialized = false;

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

        console.log('ELATLA');

        beginSceneTransition(
            new Transition('fromLeft', sceneState.camera, () => {
          })
        );
      })();
    }
  );
</script>

<div class="flex items-center justify-center w-full min-h-100">
  <Terminal lines={["elatla", "gigachad unparalleled"]} typingSpeed={100} />
</div>