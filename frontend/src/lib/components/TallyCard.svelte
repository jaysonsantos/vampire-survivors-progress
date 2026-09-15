<script lang="ts">
  import type { Tally } from "../types.ts";
  import ProgressBar from "./ProgressBar.svelte";

  interface Props {
    label: string;
    tally: Tally;
    hint?: string | null;
  }

  let { label, tally, hint = null }: Props = $props();
</script>

<div class="card stat">
  <div class="small muted">{label}</div>
  <div class="value">{tally.owned}<span class="of muted">/ {tally.known}</span></div>
  <ProgressBar part={tally.owned} total={tally.known} />
  {#if hint !== null}
    <div class="small muted">{hint}</div>
  {/if}
</div>

<style>
  .stat {
    display: grid;
    gap: 0.35rem;
    align-content: start;
  }

  .value {
    font-size: 1.5rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .of {
    font-size: 0.95rem;
    font-weight: 500;
    margin-left: 0.35rem;
  }
</style>
