<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  import rightArrowImg from '$lib/assets/dialogue_box_right_arrow.png';
  import downArrowImg from '$lib/assets/dialogue_box_down_arrow.png';

  import { Sprite } from '$lib/engine/Sprite';

  const {
    dialogues = {},
    dialogueId,
    speed = 20,
    borderWidth = 1,
    bgColor = 'var(--bg-color)',
    fgColor = 'var(--fg-color)',
    padding = '10px',
    width = 200,
    height = 3,
    fontSize = '1em',
    style = '',
  } = $props<{
    dialogues: { [key: string]: string[] };
    dialogueId: string;
    speed?: number;
    borderWidth?: number;
    bgColor?: string;
    fgColor?: string;
    padding?: string;
    width?: number;
    height?: number;
    fontSize?: string;
    style?: string;
  }>();

  let currentDialogueIndex = $state(0);
  let currentLineText = $state('');
  let displayedText = $state('');
  let charIndex = $state(0);
  let isTyping = $state(false);
  let isActive = $state(true);
  let typeTimeoutId = $state<ReturnType<typeof setTimeout> | null>(null);
  let downArrowTimeoutId = $state<ReturnType<typeof setTimeout> | null>(null);
  let downArrowYOffset = $state(0);

  let rightArrowCanvas = $state<HTMLCanvasElement | undefined>(undefined);
  let rightArrowSpriteInstance = $state<Sprite | null>(null);

  let downArrowCanvas = $state<HTMLCanvasElement | undefined>(undefined);
  let downArrowSpriteInstance = $state<Sprite | null>(null);

  // Keep track of the last processed dialogueId to prevent re-resetting on every currentDialogueIndex change
  let lastProcessedDialogueId = $state<string | null>(null);

  onMount(() => {
    const rightArrowSpr = new Sprite(rightArrowImg, borderWidth);
    rightArrowSpr.awaitLoad()
      .then(() => {
        rightArrowSpriteInstance = rightArrowSpr;
      })
      .catch(error => {
        console.error('[DialogueBox] Error loading right arrow sprite:', error);
      });

    const downArrowSpr = new Sprite(downArrowImg, borderWidth);
    downArrowSpr.awaitLoad()
      .then(() => {
        downArrowSpriteInstance = downArrowSpr;
      })
      .catch(error => {
        console.error('[DialogueBox] Error loading down arrow sprite:', error);
      });
  });

  onDestroy(() => {
    if (typeTimeoutId) clearTimeout(typeTimeoutId);
    console.log('[DialogueBox] Component destroyed.');
  });

  // Effect for managing dialogue state based on dialogueId and currentDialogueIndex
  $effect(() => {
    if (!dialogueId || !dialogues[dialogueId]) {
      // If no valid dialogueId, clear everything
      if (currentDialogueIndex !== 0 || displayedText !== '' || isTyping) {
          console.log('[DialogueBox] Effect: No valid dialogueId. Clearing dialogue state.');
          if (typeTimeoutId) clearTimeout(typeTimeoutId);
          currentDialogueIndex = 0;
          charIndex = 0;
          displayedText = '';
          currentLineText = '';
          isTyping = false;
      }
      isActive = false;
      lastProcessedDialogueId = null; // Reset for next valid dialogueId
      return;
    }

    // Only reset if dialogueId has actually changed
    // or if it's the first time processing this dialogueId
    if (dialogueId !== lastProcessedDialogueId) {
        console.log(`[DialogueBox] Effect: Dialogue ID changed to "${dialogueId}". Resetting.`);
        resetDialogueState(); // Reset states without immediately starting typing
        lastProcessedDialogueId = dialogueId; // Update the tracker
    }

    // Handle typing for the current line
    if (currentDialogueIndex < dialogues[dialogueId].length) {
      // Only set currentLineText if it's different to prevent redundant effects
      const newLineText = dialogues[dialogueId][currentDialogueIndex];
      if (currentLineText !== newLineText) { // Only restart typing if line changes or not typing
        currentLineText = newLineText;
        startTyping();
      }
    } else {
      // Dialogue finished
      isActive = false;

      if (displayedText !== '' || isTyping) { // Only clear if not already clear
        if (typeTimeoutId) clearTimeout(typeTimeoutId);
        currentLineText = '';
        displayedText = '';
        isTyping = false;
      }
    }
  });

  // Effect for drawing the right arrow on the canvas
  $effect(() => {
    if (rightArrowCanvas && rightArrowSpriteInstance && borderWidth > 0) {
      const rightArrowCtx = rightArrowCanvas.getContext('2d');
      if (!rightArrowCtx) {
        console.error("[DialogueBox] Failed to get canvas context in reactive effect.");
        return;
      }

      const rightArrowWidth = rightArrowSpriteInstance.width * borderWidth;
      const rightArrowHeight = rightArrowSpriteInstance.height * borderWidth;

      if (rightArrowWidth <= 0 || rightArrowHeight <= 0) {
        console.warn(`[DialogueBox] Calculated arrow dimensions are zero or negative (${rightArrowWidth}x${rightArrowHeight}). Skipping draw.`);
      } else {
        rightArrowCanvas.width = rightArrowWidth;
        rightArrowCanvas.height = rightArrowHeight;

        rightArrowCtx.imageSmoothingEnabled = false;
        rightArrowCtx.drawImage(rightArrowSpriteInstance.img, 0, 0, rightArrowWidth, rightArrowHeight);
      }
    }
  });

  // Effect for drawing the down arrow on the canvas
  $effect(() => {
    if (downArrowCanvas && downArrowSpriteInstance && borderWidth > 0) {
      const downArrowCtx = downArrowCanvas.getContext('2d');
      if (!downArrowCtx) {
        console.error("[DialogueBox] Failed to get canvas context in reactive effect.");
        return;
      }

      const rightArrowWidth = downArrowSpriteInstance.width * borderWidth;
      const rightArrowHeight = downArrowSpriteInstance.height * borderWidth;

      if (rightArrowWidth <= 0 || rightArrowHeight <= 0) {
        console.warn(`[DialogueBox] Calculated arrow dimensions are zero or negative (${rightArrowWidth}x${rightArrowHeight}). Skipping draw.`);
      } else {
        downArrowCanvas.width = rightArrowWidth;
        downArrowCanvas.height = rightArrowHeight;

        downArrowCtx.imageSmoothingEnabled = false;
        downArrowCtx.drawImage(downArrowSpriteInstance.img, 0, 0, rightArrowWidth, rightArrowHeight);
      }
    }
  });

  // --- Functions ---

  // Helper function to reset dialogue state without starting typing immediately
  function resetDialogueState() {
    if (typeTimeoutId) clearTimeout(typeTimeoutId);
    currentDialogueIndex = 0;
    charIndex = 0;
    displayedText = '';
    isTyping = false;
    currentLineText = ''; // Ensure this is also cleared
  }

  function startTyping() {
    if (typeTimeoutId) clearTimeout(typeTimeoutId); // Clear any existing typing timeout
    if (downArrowTimeoutId) clearTimeout(downArrowTimeoutId);
    displayedText = ''; // Reset displayed text for new line
    charIndex = 0;
    isTyping = true;
    isActive = true;
    typeCharacter();
  }

  function typeCharacter() {
    if (charIndex < currentLineText.length) {
      displayedText += currentLineText[charIndex];
      charIndex++;
      typeTimeoutId = setTimeout(typeCharacter, speed);
    } else {
      isTyping = false;
      if (typeTimeoutId) clearTimeout(typeTimeoutId);
      downArrowTimeoutId = setTimeout(animateDownArrow, 500);
    }
  }

  function animateDownArrow() {
    console.log('animating down arrow')
    downArrowYOffset = downArrowYOffset === 0 ? 0.1 : 0;

    downArrowTimeoutId = setTimeout(animateDownArrow, 500);
  }

  export function advanceDialogue() {
    if (isTyping) {
      skipLine();
    } else {
      currentDialogueIndex++;
    }
  }

  function skipLine() {
    if (typeTimeoutId) clearTimeout(typeTimeoutId);
    displayedText = currentLineText;
    charIndex = currentLineText.length;
    isTyping = false;
  }
</script>

{#if isActive}
  <div
    role="button"
    tabindex="0"
    class="absolute leading-[1.2] z-10 cursor-pointer"
    onclick={advanceDialogue}
    onkeydown={(e) => {
      // Trigger advanceDialogue if Enter or Space is pressed
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); // Prevent default scroll for Space key
        advanceDialogue();
      }
    }}
    style="
      border: {borderWidth}px solid {fgColor};
      background-color: {bgColor};
      color: {fgColor};
      padding: {padding};
      width: {width}px;
      min-height: {height}em;
      font-size: {fontSize};
      {style}
    "
  >
    <!-- Right Arrow -->
    <div
      class="bg-[var(--bg-color)] absolute"
      style="
        min-width: {borderWidth}px;
        top: -{borderWidth}px;
        left: {width - borderWidth * 2}px;
        z-index: 11;
      "
    >
      <canvas bind:this={rightArrowCanvas} width=0 height=0></canvas>
    </div>

    <!-- Down Arrow -->
    {#if !isTyping}
      <div
        class="absolute"
        style="
          top: {height - 1.1 + downArrowYOffset}em;
          right: 0.5em;
          z-index: 11;
        "
      >
        <canvas bind:this={downArrowCanvas} width=0 height=0></canvas>
      </div>
    {/if}

    <!-- Displayed Text -->
    <p class="m-0 overflow-hidden w-full h-full p-0 select-none whitespace-pre-wrap mt-[-0.15em]">
      {displayedText}
    </p>
  </div>
{/if}

<style></style>