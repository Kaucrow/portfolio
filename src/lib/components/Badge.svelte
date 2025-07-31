<script lang="ts">
  import Icon from "./Icon.svelte";

  const {
    name,
    fgColor = 'var(--bg-color)',
    bgColor = 'var(--fg-color)',
    icon,
    rounded = false,
    class: customClass = '',
  } = $props<{
    name: string;
    fgColor?: string;
    bgColor?: string;
    icon?: string;
    rounded?: boolean;
    class?: string;
  }>();
</script>

<span
  class="flex flex-row gap-2 items-center text-[1.5em] px-2 py-1 leading-none {rounded ? 'pixel-corners' : ''} {customClass}"
  style="color: {fgColor}; background-color: {bgColor};"
>
  {#if icon}
    <Icon name={icon} color={fgColor} size={16}/>
  {/if}
  {name}
</span>

<style>
  .pixel-corners {
    clip-path: polygon(
      0px calc(100% - 2px),
      2px calc(100% - 2px),
      2px 100%,
      calc(100% - 2px) 100%,
      calc(100% - 2px) calc(100% - 2px),
      100% calc(100% - 2px),
      100% 2px,
      calc(100% - 2px) 2px,
      calc(100% - 2px) 0px,
      2px 0px,
      2px 2px,
      0px 2px
    );
  }
</style>