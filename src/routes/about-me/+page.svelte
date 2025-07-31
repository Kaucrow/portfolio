<script lang="ts">
	import { onDestroy, onMount } from "svelte";

  import { useScene } from "$lib/engine/Scene.svelte";
  import { Transition } from "$lib/engine/Transition";

  const { sceneState, addRoomObject, beginSceneTransition } = useScene();

  import ditherHeavyImg from "$lib/assets/dither_heavy.png";

  import pcLogoImg from "$lib/assets/taskbar-icons/pc_logo.png";
  import speakerImg from "$lib/assets/taskbar-icons/speaker.png";
  import monitorSmImg from "$lib/assets/taskbar-icons/monitor.png";
  import triangleUpImg from "$lib/assets/taskbar-icons/triangle_up.png";
  import vsCodeSmImg from "$lib/assets/taskbar-icons/vscode.png";
  import browserSmImg from "$lib/assets/taskbar-icons/browser.png";
  import folderSmImg from "$lib/assets/taskbar-icons/folder.png";
  import terminalSmImg from "$lib/assets/taskbar-icons/terminal.png";

  import browserImg from "$lib/assets/desktop-icons/browser.png";
  import monitorImg from "$lib/assets/desktop-icons/monitor.png";
  import vsCodeImg from "$lib/assets/desktop-icons/vscode.png";
  import folderImg from "$lib/assets/desktop-icons/folder.png";
  import terminalImg from "$lib/assets/desktop-icons/terminal.png";

  import Terminal from "$lib/components/Terminal.svelte";

  let pageObjectsInitialized = false;

  let currentTime = $state(new Date());
  let timeInterval: ReturnType<typeof setInterval>;

  onMount(() => {
    timeInterval = setInterval(() => {
      currentTime = new Date();
    }, 1000);
  });

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

  function formatTime(date: Date) {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  onDestroy(() => {
    clearInterval(timeInterval);
  });
</script>

{#snippet desktopIcon(icon: string, caption: string)}
  <div class="flex flex-col text-[var(--fg-color)] items-center">
    <img
      class="pixelated h-[34px] w-[34px]"
      src={icon}
      alt="Browser"
    />
    <span>{caption}</span>
  </div>
{/snippet}

<div class="flex items-center justify-center w-full min-h-100 select-none">
  <div class="absolute flex flex-col gap-6 top-10 left-10 z-0">
    {@render desktopIcon(browserImg, "Browser")}
    {@render desktopIcon(monitorImg, "My Computer")}
    {@render desktopIcon(vsCodeImg, "Code")}
    {@render desktopIcon(folderImg, "Files")}
    {@render desktopIcon(terminalImg, "Terminal")}
  </div>

  <Terminal lines={["elatla", "gigachad unparalleled"]} typingSpeed={100} />

  <!-- Taskbar -->
  <div 
    class="fixed bottom-0 border-y-2 border-[var(--fg-color)] min-w-full"
    style="
      background-color: var(--fg-color);
      background-size: 256px 256px;
      background-image: url('{ditherHeavyImg}');
      background-repeat: repeat;
      image-rendering: pixelated;
    "
  >
    <div class="relative flex flex-row justify-between px-1 text-[1em] text-[var(--bg-color)] items-center h-full w-full select-none">
      <!-- Left Group -->
      <div class="flex flex-row bg-[var(--fg-color)] px-1">
        <div class="flex flex-row items-center gap-2 bg-[var(--fg-color)] px-2 py-0.75 leading-none border-1 border-[var(--bg-color)] box-border">
          <img
            class="pixelated h-[9px] w-auto"
            src={pcLogoImg}
            alt="Logo"
          />
          Start 
        </div>
        <div class="flex flex-row items-center gap-2 bg-[var(--fg-color)] px-3">
          <img
            class="pixelated h-[9px] w-auto"
            src={browserSmImg}
            alt="Browser"
          />
          <img
            class="pixelated h-[9px] w-auto"
            src={folderSmImg}
            alt="Folder"
          />
          <img
            class="pixelated h-[9px] w-auto"
            src={vsCodeSmImg}
            alt="VsCode"
          />
        </div>
        <div class="flex flex-row items-center gap-2 bg-[var(--fg-color)] px-2 py-0.75 leading-none border-1 border-[var(--bg-color)] box-border">
          <img
            class="pixelated h-[9px] w-auto"
            src={terminalSmImg}
            alt="Terminal"
          />
          Terminal
        </div>
      </div>
      <!-- Right Group -->
      <div class="flex flex-row items-center gap-2 bg-[var(--fg-color)] px-3 py-1 leading-none">
        <img
          class="pixelated h-[9px] w-auto"
          src={triangleUpImg}
          alt="Triangle Up"
        />
        <img
          class="pixelated h-[9px] w-auto"
          src={monitorSmImg}
          alt="Monitor"
        />
        <img
          class="pixelated h-[9px] w-auto"
          src={speakerImg}
          alt="Speaker"
        />
        {formatTime(currentTime)}
      </div>
    </div>
  </div>
</div>