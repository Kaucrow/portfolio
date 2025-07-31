<script lang="ts">
	import { onDestroy, onMount } from "svelte";

  import { useScene } from "$lib/engine/Scene.svelte";
  import { Transition } from "$lib/engine/Transition";

  const { sceneState, beginSceneTransition } = useScene();

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

  import pfpImg from "$lib/assets/pfp.png";

  import Terminal from "$lib/components/Terminal.svelte";
  import PcWindow from "$lib/components/PcWindow.svelte";
  import Badge from "$lib/components/Badge.svelte";

  let pageObjectsInitialized = false;

  let currentTime = $state(new Date());
  let timeInterval: ReturnType<typeof setInterval>;

  onMount(() => {
    if (document) {
      document.documentElement.style.overflow = 'hidden';
    }

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

{#snippet image(src: string, size: number)}
  <img
    class="pixelated h-[{size}px] w-auto"
    {src}
    alt=""
  />
{/snippet}

{#snippet desktopIcon(icon: string, caption: string)}
  <div class="flex flex-col text-[var(--fg-color)] items-center">
    {@render image(icon, 34)}
    <span>{caption}</span>
  </div>
{/snippet}

<div class="flex items-center justify-center w-full h-full select-none">
  <!-- Desktop Icons -->
  <div class="absolute flex flex-col gap-6 top-10 left-10 z-0">
    {@render desktopIcon(browserImg, "Browser")}
    {@render desktopIcon(monitorImg, "My Computer")}
    {@render desktopIcon(vsCodeImg, "Code")}
    {@render desktopIcon(folderImg, "Files")}
    {@render desktopIcon(terminalImg, "Terminal")}
  </div>

  <!-- Profile Picture -->
  <PcWindow name="Me" x={200} y={30}>
    <div class="flex flex-row gap-4 items-center">
      {@render image(pfpImg, 96)}
      <div class="flex flex-col gap-0 items-start">
        <span class="text-[2em] font-bold leading-none">Javier Perez</span>
        <span class="text-[1.5em] leading-none">Kaucrow</span>
      </div>
    </div>
  </PcWindow>

  <!-- Hobbies -->
  <Terminal name="Hobbies" class="max-w-1/2" x={150} y={220} lines={[`
    When I'm away from the keyboard, you'll usually find me rocking out on my electric guitar or diving into indie games. Often, these hobbies feed back into my technical work, whether I'm tinkering with audio circuits inspired by guitar effects or coding projects inspired by the latest game I played.`
  ]} typingSpeed={30} />

  <!-- About Me -->
  <Terminal name="About me" class="max-w-1/2" x={600} y={40} lines={[`
    Hi, I'm Javier Perez (but online, I go by Kaucrow). I'm a computer engineering student passionate about software development, from embedded systems to full-stack web applications.

    I've worked with IoT (sensors, microcontrollers, and embedded firmware) and web development, building efficient frontends with Svelte and React, and robust backends with Rust, Python, C#, and Node.js. My language toolkit also includes C++ and TypeScript, and I'm always eager to learn more.

    When I'm not working on coursework or professional projects, I enjoy experimenting with side projects, like game mods or small physics simulations, to explore new ideas and sharpen my skills.`
  ]} typingSpeed={5} />

  <!-- Contact -->
  <PcWindow name="Contact" class="max-w-1/2" x={200} y={520}>
    <div class="flex flex-row gap-2">
      <a href="https://github.com/Kaucrow">
        <Badge name="GitHub" icon="github" rounded />
      </a>
      <a href="https://placehold.co/600x400?text=Coming Soon">
        <Badge name="LinkedIn" icon="linkedin" rounded />
      </a>
      <a href="mailto:kaucrow@protonmail.com">
        <Badge name="Email" icon="mail" rounded />
      </a>
    </div>
  </PcWindow>

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
          {@render image(pcLogoImg, 9)}
          Start 
        </div>
        <div class="flex flex-row items-center gap-2 bg-[var(--fg-color)] px-3">
          {@render image(browserSmImg, 9)}
          {@render image(folderSmImg, 9)}
          {@render image(vsCodeSmImg, 9)}
        </div>
        <div class="flex flex-row items-center gap-2 bg-[var(--fg-color)] px-2 py-0.75 leading-none border-1 border-[var(--bg-color)] box-border">
          {@render image(terminalSmImg, 9)}
          Terminal
        </div>
      </div>
      <!-- Right Group -->
      <div class="flex flex-row items-center gap-2 bg-[var(--fg-color)] px-3 py-1 leading-none">
        {@render image(triangleUpImg, 9)}
        {@render image(monitorSmImg, 9)}
        {@render image(speakerImg, 9)}
        {formatTime(currentTime)}
      </div>
    </div>
  </div>
</div>