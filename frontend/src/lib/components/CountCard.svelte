<script lang="ts">
  import { formatCount } from "../save/format.ts";
  import type { Tally } from "../types.ts";

  interface Props {
    label: string;
    tally: Tally;
  }

  let { label, tally }: Props = $props();
</script>

<div class="card stat">
  <div class="small muted">{label}</div>
  <div class="value">{formatCount(tally.owned)}</div>
  <div class="small muted">{formatCount(tally.known)} identifiers known</div>
</div>

<style>
  .stat {
    display: grid;
    gap: 0.15rem;
    align-content: start;
  }

  .value {
    font-size: 1.5rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
</style>
