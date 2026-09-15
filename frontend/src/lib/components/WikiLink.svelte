<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    href: string;
    /** Screen readers get the label; sighted users get the children or the label. */
    label: string;
    /** `pill` draws a bordered button-like link. `inline` is plain text. */
    kind?: "pill" | "inline";
    children?: Snippet | null;
  }

  let { href, label, kind = "inline", children = null }: Props = $props();
</script>

<a {href} class="wiki {kind}" target="_blank" rel="noopener noreferrer" aria-label="{label} on the wiki">
  {#if children !== null}
    {@render children()}
  {:else}
    {label}
  {/if}
  <svg class="ext" viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
    <path d="M4 1h7v7M11 1 4.5 7.5M2 3v7h7" fill="none" stroke="currentColor" stroke-width="1.4" />
  </svg>
</a>

<style>
  .wiki {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    text-decoration: none;
    white-space: nowrap;
  }

  .inline {
    color: var(--accent-soft);
  }

  .inline:hover {
    text-decoration: underline;
  }

  .pill {
    font-size: 0.8rem;
    color: var(--text-muted);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 0.15rem 0.6rem;
    background: var(--bg-sunken);
    transition:
      border-color 120ms ease,
      color 120ms ease;
  }

  .pill:hover {
    color: var(--text);
    border-color: var(--accent);
  }

  .ext {
    opacity: 0.7;
    flex: none;
  }
</style>
