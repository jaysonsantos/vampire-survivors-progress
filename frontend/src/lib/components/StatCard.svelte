<script lang="ts">
  interface Props {
    label: string;
    value: string;
    hint?: string | null;
  }

  let { label, value, hint = null }: Props = $props();
</script>

<div class="card stat">
  <div class="label small muted">{label}</div>
  <div class="value">{value}</div>
  {#if hint !== null}
    <div class="small muted">{hint}</div>
  {/if}
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
