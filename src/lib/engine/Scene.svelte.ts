import { Camera } from '$lib/engine/Camera.svelte';
import { Room } from '$lib/engine/Room';
import borderImg from '$lib/assets/room_border.png';
import { browser } from '$app/environment';

const sceneState = $state({
  canvas: null as HTMLCanvasElement | null,
  ctx: null as CanvasRenderingContext2D | null,
  camera: null as Camera | null,
  room: null as Room | null,
  isInitialized: false,
  lastResizeTimestamp: 0,
});

// Internal state for initialization (these remain internal to the module)
let borderDimensions = { width: 0, height: 0 };
let lastTime: DOMHighResTimeStamp = 0;
let animationFrameId: number | null = null;

export function useScene() {
  // --- Core Initialization Effect ---
  // This effect will run once when `sceneState.canvas` is first set
  // and `sceneState.isInitialized` is false.
  $effect(() => {
    // Only proceed if canvas is available and not already initialized
    if (!sceneState.canvas || sceneState.isInitialized) {
      return;
    }

    (async () => {
      console.log('Attempting to initialize scene from useScene effect...');
      sceneState.ctx = sceneState.canvas!.getContext('2d');
      if (!sceneState.ctx) throw new Error("Failed to get MainCanvas context");
      sceneState.ctx.imageSmoothingEnabled = false;

      sceneState.camera = new Camera(sceneState.canvas!.width, sceneState.canvas!.height);
      sceneState.room = new Room(1920, 1080); // Assuming default room dimensions

      let tempImage = new Image();
      await new Promise<void>((resolve, reject) => {
        tempImage.src = borderImg; // Use the imported asset directly
        tempImage.onload = () => {
          borderDimensions.width = tempImage.width;
          borderDimensions.height = tempImage.height;
          resolve();
        };
        tempImage.onerror = (e) => {
          console.error(`Error loading border image from ${borderImg}: `, e);
          reject(e);
        };
      });

      // Perform the initial scale update
      updateSceneScale();
      lastTime = performance.now(); // Initialize lastTime for the animation loop

      sceneState.isInitialized = true;
      console.log('Scene initialized.');
    })();
  });

  // --- Animation Loop Effect ---
  $effect(() => {
    // This effect's dependencies ensure it only runs once the scene is fully initialized.
    if (!sceneState.isInitialized || !sceneState.ctx || !sceneState.room || !sceneState.camera || !sceneState.canvas) {
      return;
    }

    // Reset lastTime right when the loop is about to start for clean timing
    lastTime = performance.now();

    const loop = (currentTime: DOMHighResTimeStamp) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      sceneState.ctx!.clearRect(0, 0, sceneState.canvas!.width, sceneState.canvas!.height);
      sceneState.room!.update(sceneState.camera!, deltaTime);
      sceneState.room!.draw(sceneState.ctx!, sceneState.camera!);

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    // Cleanup function: This runs when the effect is torn down (e.g., component unmounts)
    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };
  });

  // --- Window Resize Effect ---
  $effect(() => {
    // Ensure this only runs in the browser and after initialization
    if (!browser || !sceneState.isInitialized || !sceneState.canvas) {
      return;
    }

    const handleWindowResize = () => {
      updateSceneScale();
      sceneState.lastResizeTimestamp = performance.now();
    };

    window.addEventListener('resize', handleWindowResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  });

  // --- Helper functions (remain internal to the module or returned by the hook) ---

  // Update scene scale
  function updateSceneScale() {
    if (!sceneState.canvas || !borderDimensions.width || !borderDimensions.height) return;

    const effectiveWindowWidth = window.innerWidth - (32 * 2);
    const effectiveWindowHeight = window.innerHeight - 196;

    const scaleFactorWidth = effectiveWindowWidth / borderDimensions.width;
    const scaleFactorHeight = effectiveWindowHeight / borderDimensions.height;

    let scale = Math.min(scaleFactorWidth, scaleFactorHeight);
    let newGlobalScale = Math.floor(scale);
    if (newGlobalScale <= 0) {
      newGlobalScale = 1;
    }

    // Only update if the value has actually changed.
    // Floating point comparison with epsilon
    if (sceneState.camera) {
      if (Math.abs(sceneState.camera.globalScale - newGlobalScale) > 0.0001) {
        sceneState.camera.globalScale = newGlobalScale;
      }
    }

    if (sceneState.camera && sceneState.canvas) {
      // Only update if viewport dimensions have actually changed
      if (sceneState.camera.viewportWidth !== sceneState.canvas.width || sceneState.camera.viewportHeight !== sceneState.canvas.height) {
        sceneState.camera.setViewport(sceneState.canvas.width, sceneState.canvas.height);
      }
    }
  }

  // --- Public functions to be returned by the hook ---
  const setCanvas = (canvasElement: HTMLCanvasElement) => {
    sceneState.canvas = canvasElement;
  };

  const addRoomObject = (obj: any) => {
    if (sceneState.room) {
      sceneState.room.getRootContainer().add(obj);
    } else {
      console.warn('Cannot add RoomObject: scene.room is not initialized.');
    }
  };

  const beginSceneTransition = (transition: any) => {
    if (sceneState.room) {
      sceneState.room.beginTransition(transition);
    } else {
      console.warn('Cannot begin transition: scene.room is not initialized.');
    }
  };

  return {
    sceneState,
    setCanvas, // Expose for +layout.svelte to call
    addRoomObject,
    beginSceneTransition,
  };
}