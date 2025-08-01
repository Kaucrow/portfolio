import { Camera } from '$lib/engine/Camera.svelte';
import { Room } from '$lib/engine/Room';
import { type Dir } from '$lib/engine/Transition';

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

let borderDimensions = { width: 0, height: 0 };
let lastTime: DOMHighResTimeStamp = 0;
let animationFrameId: number | null = null;
let initialized = false; // Separate flag to track initialization

export function useScene() {
  // --- Initialization (run once) ---
  $effect(() => {
    if (initialized || !sceneState.canvas) return;
    
    console.log('Initializing scene...');
    initialized = true;
    
    const init = async () => {
      sceneState.ctx = sceneState.canvas!.getContext('2d');
      if (!sceneState.ctx) throw new Error("Failed to get MainCanvas context");
      sceneState.ctx.imageSmoothingEnabled = false;

      sceneState.camera = new Camera(sceneState.canvas!.width, sceneState.canvas!.height);

      try {
        const tempImage = new Image();
        await new Promise<void>((resolve, reject) => {
          tempImage.src = borderImg;
          tempImage.onload = () => {
            borderDimensions.width = tempImage.width;
            borderDimensions.height = tempImage.height;
            resolve();
          };
          tempImage.onerror = reject;
        });

        updateSceneScale();
      } catch (error) {
        console.error('Initialization failed:', error);
        initialized = false; // Allow retry
      }

      sceneState.room = new Room(sceneState.ctx, sceneState.camera, 1920, 1080);
        
      lastTime = performance.now();
      sceneState.isInitialized = true;
      console.log('Scene initialized successfully');
    };

    init().catch(console.error);
  });

  // --- Animation Loop ---
  $effect(() => {
    if (!sceneState.isInitialized) return;

    lastTime = performance.now();
    const loop = (currentTime: DOMHighResTimeStamp) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      sceneState.ctx?.clearRect(0, 0, sceneState.canvas!.width, sceneState.canvas!.height);
      sceneState.room?.update(deltaTime);
      sceneState.room?.draw();

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };
  });

  // --- Resize Handler ---
  $effect(() => {
    if (!browser || !sceneState.isInitialized) return;

    const handleResize = () => {
      updateSceneScale();
      sceneState.lastResizeTimestamp = performance.now();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  // --- Helper Functions ---
  function updateSceneScale() {
    if (!sceneState.canvas || !borderDimensions.width || !borderDimensions.height) return;

    const effectiveWindowWidth = window.innerWidth - 64;
    const effectiveWindowHeight = window.innerHeight - 196;

    const scaleFactorWidth = effectiveWindowWidth / borderDimensions.width;
    const scaleFactorHeight = effectiveWindowHeight / borderDimensions.height;
    const newGlobalScale = Math.max(1, Math.floor(Math.min(scaleFactorWidth, scaleFactorHeight)));

    if (sceneState.camera && Math.abs(sceneState.camera.globalScale - newGlobalScale) > 0.0001) {
      sceneState.camera.globalScale = newGlobalScale;
    }

    if (sceneState.camera && sceneState.canvas) {
      sceneState.camera.setViewport(sceneState.canvas.width, sceneState.canvas.height);
    }
  }

  // --- Public API ---
  const setCanvas = (canvasElement: HTMLCanvasElement) => {
    if (sceneState.canvas === canvasElement) return;
    sceneState.canvas = canvasElement;
  };

  const addRoomObject = (obj: any) => {
    sceneState.room?.getRootContainer().add(obj);
  };

  const beginSceneTransition = (dir: Dir, onComplete?: Function, scrollSpeed?: number) => {
    sceneState.room?.configureTransition(dir, onComplete, scrollSpeed);
    sceneState.room?.beginTransition();
  };

  return {
    sceneState,
    setCanvas,
    addRoomObject,
    beginSceneTransition,
  };
}