<script lang="ts">
  import { onMount } from 'svelte';

  import terminalControlsImg from '$lib/assets/terminal_controls.png';

  const {
    lines,
    typingSpeed = 30,
    caretBlinkSpeed = 500,
  } = $props<{
    lines: string[];
    typingSpeed?: number;
    caretBlinkSpeed?: number;
  }>();

  let displayedLines: { text: string; fullyTyped: boolean }[] = $state([]);
  let caretVisible = $state(true);
  let currentLineIndex = $state(0);
  let currentCharIndex = 0;

  onMount(() => {
    if (lines.length > 0) {
      typeNextLine();
    }

    const caretInterval = setInterval(() => {
      caretVisible = !caretVisible;
    }, caretBlinkSpeed);

    return () => clearInterval(caretInterval);
  });

  function typeNextLine() {
    if (currentLineIndex >= lines.length) return;

    const currentLine = lines[currentLineIndex];
    if (currentCharIndex < currentLine.length) {
      setTimeout(() => {
        if (displayedLines.length <= currentLineIndex) {
          displayedLines = [...displayedLines, { text: '', fullyTyped: false }];
        }

        displayedLines[currentLineIndex] = {
          text: currentLine.substring(0, currentCharIndex + 1),
          fullyTyped: false
        };

        currentCharIndex++;
        typeNextLine();
      }, typingSpeed);
    } else {
      displayedLines[currentLineIndex] = {
        text: currentLine,
        fullyTyped: true
      };
      currentLineIndex++;
      currentCharIndex = 0;
      
      if (currentLineIndex < lines.length) {
        setTimeout(typeNextLine, typingSpeed * 2);
      }
    }
  }
</script>

<!-- Main Container -->
<div class="flex flex-col">
  <!-- Controls -->
  <div class="flex flex-row items-center relative border-x-2 border-t-2 border-[var(--fg-color)] min-h-[2em]">
    <img
      class="cursor-pointer pixelated absolute right-2 transform h-[18px] w-auto"
      src={terminalControlsImg}
      alt="Controls"
    />
  </div>

  <!-- Content -->
  <div class="bg-[var(--bg-color)] text-[var(--fg-color)] border-2 border-[var(--fg-color)] text-[1.5em] py-2 px-4">
    {#each displayedLines as line, i}
      <div class="flex items-baseline whitespace-pre-wrap">
        <span class="mr-2">kaucrow@portfolio:/about-me$</span>
        <span>
          {line.text}
          {#if (i === currentLineIndex && !line.fullyTyped) || 
              (i === displayedLines.length - 1 && line.fullyTyped)}
            <span class="inline-block w-[0.5em] h-[0.85em] align-text-bottom overflow-hidden">
              {#if caretVisible}
                █
              {/if}
            </span>
          {/if}
        </span>
      </div>
    {/each}
  </div>
</div>