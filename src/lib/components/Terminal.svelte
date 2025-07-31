<script lang="ts">
  import { onMount } from 'svelte';

  import PcWindow from './PcWindow.svelte';

  const {
    lines,
    name,
    typingSpeed = 30,
    caretBlinkSpeed = 500,
    x = 0,
    y = 0,
    class: customClass = '',
  } = $props<{
    lines: string[];
    name?: string;
    typingSpeed?: number;
    caretBlinkSpeed?: number;
    x?: number;
    y?: number;
    class?: string;
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

<PcWindow {name} {x} {y} class={customClass}>
  {#each displayedLines as line, i}
    <div class="whitespace-pre-wrap break-words text-[1.5em]">
      <span class="whitespace-pre-wrap">kaucrow@portfolio:/about-me$ {line.text}
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
</PcWindow>