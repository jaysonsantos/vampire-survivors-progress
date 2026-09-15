<script lang="ts">
  import type { Snippet } from "svelte";
  import { type WikiPage, wikiPageUrl } from "../wiki.ts";
  import WikiLink from "./WikiLink.svelte";

  interface Props {
    title: string;
    /** Wiki page that explains this section, or `null` for none. */
    wiki?: WikiPage | null;
    /** Text of the wiki link. */
    wikiLabel?: string;
    /** `h1` for the page title, `h2` for a section. */
    level?: "h1" | "h2";
    /** Extra controls that sit at the right end of the heading row. */
    children?: Snippet | null;
  }

  let { title, wiki = null, wikiLabel = "Wiki", level = "h2", children = null }: Props = $props();
</script>

<div class="heading">
  {#if level === "h1"}
    <h1>{title}</h1>
  {:else}
    <h2>{title}</h2>
  {/if}
  <div class="actions">
    {#if children !== null}
      {@render children()}
    {/if}
    {#if wiki !== null}
      <WikiLink href={wikiPageUrl(wiki)} label={wikiLabel} kind="pill" />
    {/if}
  </div>
</div>

<style>
  .heading {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem 1rem;
    margin: 0 0 0.75rem;
    padding-bottom: 0.4rem;
    border-bottom: 1px solid var(--border);
  }

  .heading :global(h1),
  .heading :global(h2) {
    margin: 0;
  }

  .actions {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>
