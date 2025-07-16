<script lang="ts">
  import { onMount } from 'svelte';

  import deskImg from '$lib/assets/desk.png'
  import pcImg from '$lib/assets/pc.png'
  import pcShadingImg from '$lib/assets/pc_shading.png'
  import borderImg from '$lib/assets/room_border.png'
  import turntableShelfImg from '$lib/assets/turntable_shelf.png'
  import windowImg from '$lib/assets/window.png'
  import wallObjectsImg from '$lib/assets/wall_objects.png'

  import MainCanvas from '$lib/components/MainCanvas.svelte';
  import { Line } from '$lib/engine/Line';
  import { Camera } from '$lib/engine/Camera';
  import { Room } from '$lib/engine/Room';
	import { RoomObject } from '$lib/engine/RoomObject';
  import { Sprite } from '$lib/engine/Sprite';
	import { browser } from '$app/environment';

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

  let border: RoomObject | undefined = undefined;

  let lines: {
    topLeft: Line | undefined;
    topRight: Line | undefined;
    bottomRight: Line | undefined;
    bottomLeft: Line | undefined;
  } = {
    topLeft: undefined,
    topRight: undefined,
    bottomRight: undefined,
    bottomLeft: undefined
  };

  onMount(() => {
    const canvas = mainCanvas.getCanvas();
    ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Failed to get MainCanvas context");
    ctx.imageSmoothingEnabled = false;

    camera = new Camera(canvas.width, canvas.height);

    const initializeScene = async () => {
      room = new Room(1920, 1080);

      const sceneContainer = room.getRootContainer();

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

      border = new RoomObject(0, 0, new Sprite(borderImg, globalScale));
      const desk = new RoomObject(-32, 81, new Sprite(deskImg, globalScale));
      const pc = new RoomObject(-26, 63, new Sprite(pcImg, globalScale));
      const pcShading = new RoomObject(-26, 83, new Sprite(pcShadingImg, globalScale));
      const turntableShelf = new RoomObject(90, 90, new Sprite(turntableShelfImg, globalScale));
      const window = new RoomObject(-90, 0, new Sprite(windowImg, globalScale));
      const wallObjects = new RoomObject(8, 0, new Sprite(wallObjectsImg, globalScale));

      await Promise.all([
        border.sprite?.awaitLoad(),
        desk.sprite?.awaitLoad(),
        pcShading.sprite?.awaitLoad(),
        turntableShelf.sprite?.awaitLoad(),
      ]);

      sceneContainer.add(border);
      sceneContainer.add(desk);
      sceneContainer.add(pc);
      sceneContainer.add(pcShading);
      sceneContainer.add(turntableShelf);
      sceneContainer.add(window);
      sceneContainer.add(wallObjects);

      if (border.sprite) {
        lines.topLeft = new Line(
          {
            x: border.x - border.sprite.width * border.sprite.scale / 2,
            y: border.y - border.sprite.height * border.sprite.scale / 2
          },
          {
            x: -camera.viewportWidth / 2,
            y: -camera.viewportHeight / 2
          },
          'white',
          globalScale
        );

        lines.topRight = new Line(
          {
            x: border.x + border.sprite.width * border.sprite.scale / 2,
            y: border.y + border.sprite.height * border.sprite.scale / 2
          },
          {
            x: camera.viewportWidth * border.sprite.scale / 2,
            y: camera.viewportHeight * border.sprite.scale / 2
          },
          'white',
          globalScale
        );

        lines.bottomRight = new Line(
          {
            x: border.x + border.sprite.width * border.sprite.scale / 2,
            y: border.y - border.sprite.height * border.sprite.scale / 2
          },
          {
            x: camera.viewportWidth * border.sprite.scale / 2,
            y: -camera.viewportHeight * border.sprite.scale / 2
          },
          'white',
          globalScale
        );

        lines.bottomLeft = new Line(
          {
            x: -border.x - border.sprite.width * border.sprite.scale / 2,
            y: -border.y + border.sprite.height * border.sprite.scale / 2
          },
          {
            x: -camera.viewportWidth / 2,
            y: camera.viewportHeight / 2
          },
          'white',
          globalScale
        );

        if (lines.topLeft) sceneContainer.add(lines.topLeft);
        if (lines.topRight) sceneContainer.add(lines.topRight);
        if (lines.bottomRight) sceneContainer.add(lines.bottomRight);
        if (lines.bottomLeft) sceneContainer.add(lines.bottomLeft);
      }
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

    const handleResize = () => {
      if (!ctx) throw new Error("MainCanvas context is null");

      camera.viewportWidth = canvas.width;
      camera.viewportHeight = canvas.height;

      setGlobalScale();

      room.getRootContainer().updateGlobalScale(globalScale);

      if (border && border.sprite) {
        if (lines.topLeft) {
          lines.topLeft.from = {
            x: border.x - border.sprite.width * border.sprite.scale / 2,
            y: border.y - border.sprite.height * border.sprite.scale / 2
          };
          lines.topLeft.to = {
            x: -camera.viewportWidth / 2,
            y: -camera.viewportHeight / 2
          };
          lines.topLeft.width = globalScale;
        }

        if (lines.topRight) {
          lines.topRight.from = {
            x: border.x + border.sprite.width * border.sprite.scale / 2,
            y: border.y + border.sprite.height * border.sprite.scale / 2
          };
          lines.topRight.to = {
            x: camera.viewportWidth / 2,
            y: camera.viewportHeight / 2
          };
          lines.topRight.width = globalScale;
        }

        if (lines.bottomRight) {
          lines.bottomRight.from = {
            x: border.x + border.sprite.width * border.sprite.scale / 2,
            y: border.y - border.sprite.height * border.sprite.scale / 2
          };
          lines.bottomRight.to = {
            x: camera.viewportWidth / 2,
            y: -camera.viewportHeight / 2
          };
          lines.bottomRight.width = globalScale;
        }

        if (lines.bottomLeft) {
          lines.bottomLeft.from = {
            x: -border.x - border.sprite.width * border.sprite.scale / 2,
            y: -border.y + border.sprite.height * border.sprite.scale / 2
          };
          lines.bottomLeft.to = {
            x: -camera.viewportWidth / 2,
            y: camera.viewportHeight / 2
          };
          lines.bottomLeft.width = globalScale;
        }
      }
    };
    window.addEventListener('resize', handleResize);

    const loop = () => {
      if (!ctx) throw new Error("MainCanvas context is null");

      ctx.imageSmoothingEnabled = false;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      room.draw(ctx, camera);

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
</script>

<MainCanvas bind:this={mainCanvas}/>