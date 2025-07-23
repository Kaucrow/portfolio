<script lang="ts">
  import { onMount } from "svelte";
  import { browser } from "$app/environment";

  import MainCanvas from "$lib/components/MainCanvas.svelte";

  import borderImg from "$lib/assets/room_border.png";

  import { Camera } from "$lib/engine/Camera";
  import { Room } from "$lib/engine/Room";
  import { Transition } from "$lib/engine/Transition";

  let mainCanvas: MainCanvas;
  let ctx: CanvasRenderingContext2D | null = null;
  let camera: Camera;
  let room: Room;
  let globalScale: number = 0;

  let borderDimensions: {
    width: number,
    height: number
  } = {
    width: 0,
    height: 0
  };

  onMount(() => {
    const canvas = mainCanvas.getCanvas();
    ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Failed to get MainCanvas context");
    ctx.imageSmoothingEnabled = false;

    camera = new Camera(canvas.width, canvas.height);

    const initializeScene = async () => {
      room = new Room(1920, 1080);

      // Create a temp image for obtaining the border dimensions
      let tempImage = new Image();
      await new Promise((resolve, reject) => {
        tempImage.src = borderImg;
        tempImage.onload = () => {
          resolve(null);
        }
        tempImage.onerror = (e) => {
          console.error(`Error loading image from ${borderImg}: `, e);
          reject(new Error(`Failed to load image: ${borderImg}`));
        }
      });
      borderDimensions.width = tempImage.width;
      borderDimensions.height = tempImage.height;

      setGlobalScale();

      room.beginTransition(new Transition('fromLeft', globalScale, camera));
    };

    initializeScene();

    const setGlobalScale = () => {
      if (!browser) return;

      const effectiveWindowWidth = window.innerWidth - (32 * 2);
      const effectiveWindowHeight = window.innerHeight - 196;

      const scaleFactorWidth = effectiveWindowWidth / borderDimensions.width;
      const scaleFactorHeight = effectiveWindowHeight / borderDimensions.height;

      let scale = Math.min(scaleFactorWidth, scaleFactorHeight);

      globalScale = Math.floor(scale);

      if (globalScale <= 0) {
        globalScale = 1;
      }
    };

    const loop = () => {
      if (!ctx) throw new Error("MainCanvas context is null");

      ctx.imageSmoothingEnabled = false;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      room.update(camera, 1);
      room.draw(ctx, camera);

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });

</script>

<div class="relative w-full h-full">
  <div class="flex items-center justify-center w-full min-h-100">
    <div class="text-8xl text-center justify-center w-[50%] min-h-100 p-4"
         style="background-color: var(--fg-color);">
      <span>About Me</span>
    </div>
  </div>

  <div class="absolute inset-0 z-20 pointer-events-none">
    <MainCanvas bind:this={mainCanvas}/>
  </div>
</div>