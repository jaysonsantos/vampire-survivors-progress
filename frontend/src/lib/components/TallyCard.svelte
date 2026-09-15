<script lang="ts">
  import type { Tally } from "../types.ts";
  import { type WikiPage, wikiPageUrl } from "../wiki.ts";
  import ProgressBar from "./ProgressBar.svelte";
  import WikiLink from "./WikiLink.svelte";

  interface Props {
    label: string;
    tally: Tally;
    hint?: string | null;
    /** Wiki page that lists this content and how to unlock it. */
    wiki?: WikiPage | null;
  }

  let { label, tally, hint = null, wiki = null }: Props = $props();

  const complete = $derived(tally.known > 0 && tally.owned >= tally.known);
</script>

<div class="card stat" class:complete>
  <div class="head small muted">
    <span>{label}</span>
    {#if wiki !== null}
      <WikiLink href={wikiPageUrl(wiki)} label={label} kind="inline">Unlocks</WikiLink>
    {/if}
  </div>
  <div class="value">{tally.owned}<span class="of muted">/ {tally.known}</span></div>
  <ProgressBar part={tally.owned} total={tally.known} />
  {#if hint !== null}
    <div class="small muted">{hint}</div>
  {/if}
</div>

<style>
  .stat {
    display: grid;
    gap: 0.4rem;
    align-content: start;
  }

  .stat.complete {
    border-color: #7ac74f66;
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

  .of {
    font-size: 0.95rem;
    font-weight: 500;
    margin-left: 0.35rem;
  }
</style>
