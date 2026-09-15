<script lang="ts">
  import { formatCount } from "../save/format.ts";
  import type { Tally } from "../types.ts";
  import { type WikiPage, wikiPageUrl } from "../wiki.ts";
  import WikiLink from "./WikiLink.svelte";

  interface Props {
    label: string;
    tally: Tally;
    /** Wiki page that lists this content and how to unlock it. */
    wiki?: WikiPage | null;
    /** What the second number counts. */
    hint?: string;
  }

  let { label, tally, wiki = null, hint = "identifiers known" }: Props = $props();
</script>

<div class="card stat">
  <div class="head small muted">
    <span>{label}</span>
    {#if wiki !== null}
      <WikiLink href={wikiPageUrl(wiki)} label={label} kind="inline">Unlocks</WikiLink>
    {/if}
  </div>
  <div class="value">{formatCount(tally.owned)}</div>
  <div class="small muted">{formatCount(tally.known)} {hint}</div>
</div>

<style>
  .stat {
    display: grid;
    gap: 0.2rem;
    align-content: start;
  }

  .head {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    align-items: baseline;
  }

  .value {
    font-size: 1.7rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    line-height: 1.1;
  }
</style>
