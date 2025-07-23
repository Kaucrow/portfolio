<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

  import deskImg from '$lib/assets/desk.png'
  import pcImg from '$lib/assets/pc.png'
  import pcShadingImg from '$lib/assets/pc_shading.png'
  import borderImg from '$lib/assets/room_border.png'
  import turntableShelfImg from '$lib/assets/turntable_shelf.png'
  import windowImg from '$lib/assets/window.png'
  import wallObjectsImg from '$lib/assets/wall_objects.png'

  import MainCanvas from '$lib/components/MainCanvas.svelte';
  import DialogueBox from '$lib/components/DialogueBox.svelte';

  import { Line } from '$lib/engine/Line';
  import { Camera } from '$lib/engine/Camera';
  import { Room } from '$lib/engine/Room';
	import { RoomObject } from '$lib/engine/RoomObject';
  import { Sprite } from '$lib/engine/Sprite';
	import { Transition } from '$lib/engine/Transition';

  let mainCanvas: MainCanvas;
  let ctx: CanvasRenderingContext2D | null = null;
  let camera: Camera;
  let room: Room;
  let globalScale: number = 0;
  let lastTime: DOMHighResTimeStamp = 0;

  let borderDimensions: {
    width: number,
    height: number
  } = {
    width: 0,
    height: 0
  };
  let border: RoomObject | undefined = undefined;

  let desk: RoomObject | undefined = undefined;

  let projectionDiv: {
    style: string,
    x: number,
    y: number,
    width: number,
    height: number
  } = {
    style: 'display: none',
    x: 0,
    y: 0,
    width: 0,
    height: 0
  };

  let projectionLines: {
    left: Line | undefined,
    middle: Line | undefined,
    right: Line | undefined
  } = {
    left: undefined,
    middle: undefined,
    right: undefined,
  };

  let depthLines: {
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

  let dialogueBox: {
    instance: DialogueBox | null,
    style: string,
    dialogues: any,
    currentDialogueId: string,
  } = {
    instance: null,
    style: "",
    dialogues: {
      intro: [
        "Hello! this is some longer text here just for testing :)",
        "Welcome to my portfolio! owo"
      ]
    },
    currentDialogueId: 'intro',
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

      border = new RoomObject(0, -30, new Sprite(borderImg, globalScale));
      desk = new RoomObject(-32, 67, new Sprite(deskImg, globalScale));
      const pc = new RoomObject(-26, 48, new Sprite(pcImg, globalScale));
      const pcShading = new RoomObject(-26, 69, new Sprite(pcShadingImg, globalScale));
      const turntableShelf = new RoomObject(95, 75, new Sprite(turntableShelfImg, globalScale));
      const window = new RoomObject(-102, -10, new Sprite(windowImg, globalScale));
      const wallObjects = new RoomObject(-8, -12, new Sprite(wallObjectsImg, globalScale));

      await Promise.all([
        border.sprite?.awaitLoad(),
        desk.sprite?.awaitLoad(),
        pcShading.sprite?.awaitLoad(),
        turntableShelf.sprite?.awaitLoad(),
      ]);

      updateProjectionDivPos();
      updateDialogueBoxPos();

      sceneContainer.add(border);
      sceneContainer.add(desk);
      sceneContainer.add(pc);
      sceneContainer.add(pcShading);
      sceneContainer.add(turntableShelf);
      sceneContainer.add(window);
      sceneContainer.add(wallObjects);

      if (desk.sprite) {
        projectionLines.left = new Line();
        projectionLines.middle = new Line();
        projectionLines.right = new Line();

        updateProjectionLinesPos();

        sceneContainer.add(projectionLines.left);
        sceneContainer.add(projectionLines.middle);
        sceneContainer.add(projectionLines.right);
      }

      if (border.sprite) {
        depthLines.topLeft = new Line();
        depthLines.topRight = new Line();
        depthLines.bottomRight = new Line();
        depthLines.bottomLeft = new Line();

        updateDepthLinesPos();

        sceneContainer.add(depthLines.topLeft);
        sceneContainer.add(depthLines.topRight);
        sceneContainer.add(depthLines.bottomRight);
        sceneContainer.add(depthLines.bottomLeft);
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

    const updateDialogueBoxPos = () => {
      if (!desk || !desk.sprite) return;

      const xOffset = 32 * (globalScale - 1);
      const yOffset = 70 * (globalScale - 1);

      const x = desk.x - 150 * globalScale - xOffset;
      const y = desk.y + 46 * globalScale + yOffset;

      const screenPos = camera.worldToScreen(x, y);

      dialogueBox.style = `
        left: ${screenPos.x}px;
        top: ${screenPos.y}px;
      `
    };

    const updateProjectionDivPos = () => {
      if (!border || !border.sprite) return;

      const yOffset = 30 * (globalScale - 1);

      projectionDiv.x = border.x + 36 * globalScale;
      projectionDiv.y = border.y - 90 * globalScale - yOffset;

      const screenPos = camera.worldToScreen(projectionDiv.x, projectionDiv.y);

      projectionDiv.width = 156 * globalScale;
      projectionDiv.height = 106 * globalScale;

      projectionDiv.style = `
        position: absolute;
        left: ${screenPos.x}px;
        top: ${screenPos.y}px;
        width: ${projectionDiv.width}px;
        height: ${projectionDiv.height}px;
        padding: ${0 * globalScale}rem;
        background: var(--fg-color);
        color: var(--bg-color);
        line-height: 0.5;
        font-size: ${1.5 * globalScale}em;
        padding: ${0.25 * globalScale}em;
      `;
    };

    const updateProjectionLinesPos = () => {
      if (desk && desk.sprite) {
        const fromPoint = {
          x: (desk.x + 46) * globalScale,
          y: (desk.y - 10) * globalScale
        };

        if (projectionLines.left) {
          projectionLines.left.from = fromPoint;
          projectionLines.left.to = {
            x: projectionDiv.x,
            y: projectionDiv.y
          };
          projectionLines.left.width = globalScale;
        }

        if (projectionLines.middle) {
          projectionLines.middle.from = fromPoint;
          projectionLines.middle.to = {
            x: projectionDiv.x,
            y: projectionDiv.y + projectionDiv.height
          };
          projectionLines.middle.width = globalScale;
        }

        if (projectionLines.right) {
          projectionLines.right.from = fromPoint;
          projectionLines.right.to = {
            x: projectionDiv.x + projectionDiv.width,
            y: projectionDiv.y + projectionDiv.height
          };
          projectionLines.right.width = globalScale;
        }
      }
    };

    const updateDepthLinesPos = () => {
      if (border && border.sprite) {
        const yOffset = 30 * (globalScale - 1);

        if (depthLines.topLeft) {
          depthLines.topLeft.from = {
            x: border.x - border.sprite.width * border.sprite.scale / 2,
            y: border.y - border.sprite.height * border.sprite.scale / 2 - yOffset
          };
          depthLines.topLeft.to = {
            x: -camera.viewportWidth / 2,
            y: -camera.viewportHeight / 2
          };
          depthLines.topLeft.width = globalScale;
        }

        if (depthLines.topRight) {
          depthLines.topRight.from = {
            x: border.x + border.sprite.width * border.sprite.scale / 2,
            y: border.y + border.sprite.height * border.sprite.scale / 2 - yOffset
          };
          depthLines.topRight.to = {
            x: camera.viewportWidth / 2,
            y: camera.viewportHeight / 2
          };
          depthLines.topRight.width = globalScale;
        }

        if (depthLines.bottomRight) {
          depthLines.bottomRight.from = {
            x: border.x + border.sprite.width * border.sprite.scale / 2,
            y: border.y - border.sprite.height * border.sprite.scale / 2 - yOffset
          };
          depthLines.bottomRight.to = {
            x: camera.viewportWidth / 2,
            y: -camera.viewportHeight / 2
          };
          depthLines.bottomRight.width = globalScale;
        }

        if (depthLines.bottomLeft) {
          depthLines.bottomLeft.from = {
            x: -border.x - border.sprite.width * border.sprite.scale / 2,
            y: border.y + border.sprite.height * border.sprite.scale / 2 - yOffset
          };
          depthLines.bottomLeft.to = {
            x: -camera.viewportWidth / 2,
            y: camera.viewportHeight / 2
          };
          depthLines.bottomLeft.width = globalScale;
        }
      }
    };

    const handleResize = () => {
      if (!ctx) throw new Error("MainCanvas context is null");

      camera.viewportWidth = canvas.width;
      camera.viewportHeight = canvas.height;

      setGlobalScale();

      room.updateGlobalScale(globalScale);

      if (border && border.sprite) {
        updateProjectionDivPos();

        updateDepthLinesPos(); 
      }

      if (desk && desk.sprite) {
        updateDialogueBoxPos();

        updateProjectionLinesPos();
      }
    };
    window.addEventListener('resize', handleResize);

    const loop = (currentTime: DOMHighResTimeStamp) => {
      if (!ctx) throw new Error("MainCanvas context is null");

      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      ctx.imageSmoothingEnabled = false;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      room.update(camera, deltaTime);
      room.draw(ctx, camera);

      requestAnimationFrame(loop);
    };

    lastTime = performance.now();
    requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  const onAboutMeClick = () => {
    room.beginTransition(
      new Transition('intoRight', globalScale, camera, () => {
        goto('/about-me');
      })
    );
  };
</script>

<div
  style={projectionDiv.style}
>
  <div class="relative z-10 grid grid-rows-3 gap-3 pl-2 h-full w-full">
    <button class="text-left cursor-pointer" onclick={onAboutMeClick}>About me</button>
    <button class="text-left">Projects</button>
    <button class="text-left">What's this?</button>
  </div>
</div>

<DialogueBox
  bind:this={dialogueBox.instance}
  dialogues={dialogueBox.dialogues}
  dialogueId={dialogueBox.currentDialogueId}
  speed={20}
  borderWidth={globalScale}
  padding="{5 * globalScale}px"
  width={200 * globalScale}
  fontSize="{1 * globalScale}em"
  style={dialogueBox.style}
/>

<div class="absolute inset-0 z-20 pointer-events-none">
  <MainCanvas bind:this={mainCanvas}/>
</div>