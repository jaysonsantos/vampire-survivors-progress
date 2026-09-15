<script lang="ts">
  import { formatRatio } from "../save/format.ts";

  interface Props {
    part: number;
    total: number;
    label?: string | null;
  }

  let { part, total, label = null }: Props = $props();

  const ratio = $derived(total > 0 ? Math.min(1, part / total) : 0);
</script>

<div class="wrap">
  {#if label !== null}
    <div class="row small">
      <span>{label}</span>
      <span class="muted">{part} / {total} · {formatRatio(part, total)}</span>
    </div>
  {/if}
  <div class="track" role="progressbar" aria-valuenow={part} aria-valuemin={0} aria-valuemax={total}>
    <div class="fill" style:width="{ratio * 100}%"></div>
  </div>
</div>

<style>
  .wrap {
    display: grid;
    gap: 0.3rem;
  }

  .row {
    display: flex;
    justify-content: space-between;
    gap: 0.6rem;
  }

  .track {
    height: 7px;
    border-radius: 999px;
    background: var(--bg-sunken);
    border: 1px solid var(--border);
    overflow: hidden;
  }

  .fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--accent-soft));
  }
</style>
