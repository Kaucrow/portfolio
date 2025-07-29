<script lang="ts">
  import Icon from "./Icon.svelte";

  const {
    name,
    fgColor = 'var(--bg-color)',
    bgColor = 'var(--fg-color)',
    icon,
    className = '',
  } = $props<{
    name: string;
    fgColor?: string;
    bgColor?: string;
    icon?: string;
    className?: string;
  }>();
</script>

<span
  class="flex flex-row gap-2 items-center text-[1.5em] px-2 py-1 leading-none {className}"
  style="color: {fgColor}; background-color: {bgColor};"
>
  {#if icon}
    <Icon name={icon} color={fgColor} size={16}/>
  {/if}
  {name}
</span>