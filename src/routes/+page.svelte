<script lang="ts">
  import { goto } from '$app/navigation';

  import { Line } from '$lib/engine/Line';
  import { RoomObject } from '$lib/engine/RoomObject';
  import { Sprite } from '$lib/engine/Sprite';
  import { Transition } from '$lib/engine/Transition';

  // Import the hook and call it to get access to the shared state and functions
  import { useScene } from '$lib/engine/Scene.svelte';

  // Call the hook at the top level of the script
  const { sceneState, addRoomObject, beginSceneTransition } = useScene();

  // Your specific assets for this page
  import deskImg from '$lib/assets/desk.png';
  import pcImg from '$lib/assets/pc.png';
  import roomBorderImg from '$lib/assets/room_border.png';
  import pcShadingImg from '$lib/assets/pc_shading.png';
  import plantKaucrowImg from '$lib/assets/plant_kaucrow.png';
  import staticObjectsImg from '$lib/assets/static_objects.png';

  import DialogueBox from '$lib/components/DialogueBox.svelte';

  let border = $state<RoomObject | undefined>(undefined);
  let desk = $state<RoomObject | undefined>(undefined);
  let pageObjectsInitialized = false;

  let projectionDiv = $state<{
    style: string,
    x: number,
    y: number,
    width: number,
    height: number
  }>({
    style: 'display: none',
    x: 0, y: 0, width: 0, height: 0
  });

  let projectionLines = $state<{
    left: Line | undefined,
    middle: Line | undefined,
    right: Line | undefined
  }>({
    left: undefined, middle: undefined, right: undefined
  });

  let depthLines = $state<{
    topLeft: Line | undefined;
    topRight: Line | undefined;
    bottomRight: Line | undefined;
    bottomLeft: Line | undefined;
  }>({
    topLeft: undefined, topRight: undefined, bottomRight: undefined, bottomLeft: undefined
  });

  let dialogueBox = $state<{
    instance: DialogueBox | null,
    style: string,
    dialogues: any,
    currentDialogueId: string,
  }>({
    instance: null,
    style: "",
    dialogues: {
      intro: [
        "*Craw!* (Hello!)",
        "*Craww!* (Welcome to my portfolio! owo)"
      ]
    },
    currentDialogueId: 'intro',
  });

  // --- Logic for Initializing Page-Specific Scene Elements ---
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

        border = new RoomObject(0, -30, new Sprite(roomBorderImg, sceneState.camera.globalScale));
        desk = new RoomObject(-33, 52, new Sprite(deskImg, sceneState.camera.globalScale));
        const pc = new RoomObject(-27, 34, new Sprite(pcImg, sceneState.camera.globalScale));
        const pcShading = new RoomObject(-27, 54, new Sprite(pcShadingImg, sceneState.camera.globalScale));
        const plantKaucrow = new RoomObject(62, 124, new Sprite(plantKaucrowImg, sceneState.camera.globalScale));
        const staticObjects = new RoomObject(-11, -2, new Sprite(staticObjectsImg, sceneState.camera.globalScale));

        await Promise.all([
          border.sprite?.awaitLoad(),
          desk.sprite?.awaitLoad(),
          pcShading.sprite?.awaitLoad(),
          plantKaucrow.sprite?.awaitLoad(),
          staticObjects.sprite?.awaitLoad()
        ]);

        addRoomObject(border);
        addRoomObject(desk);
        addRoomObject(pc);
        addRoomObject(pcShading);
        addRoomObject(plantKaucrow);
        addRoomObject(staticObjects);

        if (desk.sprite) {
          projectionLines.left = new Line();
          projectionLines.middle = new Line();
          projectionLines.right = new Line();
          addRoomObject(projectionLines.left);
          addRoomObject(projectionLines.middle);
          addRoomObject(projectionLines.right);
        }

        if (border.sprite) {
          depthLines.topLeft = new Line();
          depthLines.topRight = new Line();
          depthLines.bottomRight = new Line();
          depthLines.bottomLeft = new Line();
          addRoomObject(depthLines.topLeft);
          addRoomObject(depthLines.topRight);
          addRoomObject(depthLines.bottomRight);
          addRoomObject(depthLines.bottomLeft);
        }

        updateProjectionDivPos();
        updateDialogueBoxPos();
        updateProjectionLinesPos();
        updateDepthLinesPos();
      })();
    }
  );

  // --- Reactive updates for positioning HTML overlays and scene lines ---
  $effect(() => {
    if (sceneState.isInitialized && sceneState.lastResizeTimestamp !== 0) {
      updateOverlayPos();
    }
  });

  // --- Helper Functions to Calculate Positions based on Scene State ---
  const updateOverlayPos = () => {
    updateDialogueBoxPos();
    updateDepthLinesPos();
    updateProjectionDivPos();
    updateProjectionLinesPos();
  };

  function updateDialogueBoxPos() {
    if (!desk || !desk.sprite || !sceneState.camera || sceneState.camera.globalScale === 0) return;
    const x = desk.x - 150;
    const y = desk.y + 50;
    const screenPos = sceneState.camera.worldToScreen(x, y);
    dialogueBox.style = `left: ${screenPos.x}px; top: ${screenPos.y}px;`;
  };

  function updateProjectionDivPos() {
    if (!border || !border.sprite || !sceneState.camera || sceneState.camera.globalScale === 0) return;
    projectionDiv.x = border.x + 44;
    projectionDiv.y = border.y - 94;
    const screenPos = sceneState.camera.worldToScreen(projectionDiv.x, projectionDiv.y);
    projectionDiv.width = 156 * sceneState.camera.globalScale;
    projectionDiv.height = 98 * sceneState.camera.globalScale;
    projectionDiv.style = `
      position: absolute; left: ${screenPos.x}px; top: ${screenPos.y}px;
      width: ${projectionDiv.width}px; height: ${projectionDiv.height}px;
      padding: ${0 * sceneState.camera.globalScale}rem; background: var(--fg-color); color: var(--bg-color);
      line-height: 0.5; font-size: ${1.5 * sceneState.camera.globalScale}em; padding: ${0.25 * sceneState.camera.globalScale}em;
    `;
  };

  function updateProjectionLinesPos() {
    if (desk && desk.sprite && projectionLines.left && projectionLines.middle && projectionLines.right && sceneState.camera && sceneState.camera.globalScale !== 0) {
      const fromPoint = { x: (desk.x + 46), y: (desk.y - 10) };
      const projectionDivWidth = sceneState.camera.normalize(projectionDiv.width);
      const projectionDivHeight = sceneState.camera.normalize(projectionDiv.height);

      projectionLines.left.from = fromPoint;
      projectionLines.left.to = { x: projectionDiv.x, y: projectionDiv.y };
      projectionLines.left.width = sceneState.camera.globalScale;
      projectionLines.middle.from = fromPoint;
      projectionLines.middle.to = { x: projectionDiv.x, y: projectionDiv.y + projectionDivHeight};
      projectionLines.middle.width = sceneState.camera.globalScale;
      projectionLines.right.from = fromPoint;
      projectionLines.right.to = { x: projectionDiv.x + projectionDivWidth, y: projectionDiv.y + projectionDivHeight };
      projectionLines.right.width = sceneState.camera.globalScale;
    }
  };

  function updateDepthLinesPos() {
    if (border && border.sprite && depthLines.topLeft && depthLines.topRight && depthLines.bottomRight && depthLines.bottomLeft && sceneState.camera && sceneState.camera.globalScale !== 0) {
      const yOffset = 0;//30 * (sceneState.camera.globalScale - 1);
      const halfViewportWidth = sceneState.camera.normalize(sceneState.camera.viewportWidth / 2);
      const halfViewportHeight = sceneState.camera.normalize(sceneState.camera.viewportHeight / 2);

      depthLines.topLeft.from = { x: border.x - border.sprite.width / 2, y: border.y - border.sprite.height / 2 - yOffset };
      depthLines.topLeft.to = { x: -halfViewportWidth, y: -halfViewportHeight };
      depthLines.topLeft.width = sceneState.camera.globalScale;
      depthLines.topRight.from = { x: border.x + border.sprite.width / 2, y: border.y - border.sprite.height / 2 - yOffset };
      depthLines.topRight.to = { x: halfViewportWidth, y: -halfViewportHeight };
      depthLines.topRight.width = sceneState.camera.globalScale;
      depthLines.bottomRight.from = { x: border.x + border.sprite.width / 2, y: border.y + border.sprite.height / 2 - yOffset };
      depthLines.bottomRight.to = { x: halfViewportWidth, y: halfViewportHeight };
      depthLines.bottomRight.width = sceneState.camera.globalScale;
      depthLines.bottomLeft.from = { x: -border.x - border.sprite.width / 2, y: border.y + border.sprite.height / 2 - yOffset };
      depthLines.bottomLeft.to = { x: -halfViewportWidth, y: halfViewportHeight };
      depthLines.bottomLeft.width = sceneState.camera.globalScale;
    }
  };

  const onAboutMeClick = () => {
    if (sceneState.room && sceneState.camera && sceneState.camera.globalScale) {
      beginSceneTransition(
        new Transition('intoRight', sceneState.camera, () => {
          goto('/about-me');
        })
      );
    }
  };

  const onProjectsClick = () => {
    if (sceneState.room && sceneState.camera && sceneState.camera.globalScale) {
      beginSceneTransition(
        new Transition('intoRight', sceneState.camera, () => {
          goto('/projects');
        })
      );
    }
  }
</script>

<div style={projectionDiv.style}>
  <div class="relative z-10 grid grid-rows-3 gap-3 pl-2 h-full w-full">
    <button class="text-left cursor-pointer" onclick={onAboutMeClick}>About me</button>
    <button class="text-left cursor-pointer" onclick={onProjectsClick}>Projects</button>
    <button class="text-left">What's this?</button>
  </div>
</div>

{#if sceneState.camera}
  <DialogueBox
    bind:this={dialogueBox.instance}
    dialogues={dialogueBox.dialogues}
    dialogueId={dialogueBox.currentDialogueId}
    speed={20}
    scale={sceneState.camera.globalScale}
    padding="{5 * sceneState.camera.globalScale}px"
    width={200 * sceneState.camera.globalScale}
    fontSize="{1 * sceneState.camera.globalScale}em"
    style={dialogueBox.style}
  />
{/if}