<script lang="ts">
  import { type EntryView, VIEW } from "../filter.ts";

  interface Props {
    value: EntryView;
    /** Size of the whole list. */
    total: number;
    /** How many entries the save holds. */
    owned: number;
    /** Names the switch for screen readers, for example "Secrets". */
    label: string;
  }

  let { value = $bindable(), total, owned, label }: Props = $props();

  const OPTIONS = $derived([
    { view: VIEW.all, text: "All", count: total },
    { view: VIEW.owned, text: "Unlocked", count: owned },
    { view: VIEW.missing, text: "Missing", count: total - owned },
  ]);
</script>

<div class="switch" role="group" aria-label="{label} view">
  {#each OPTIONS as option (option.view)}
    <button
      type="button"
      class="option"
      class:active={value === option.view}
      aria-pressed={value === option.view}
      onclick={() => {
        value = option.view;
      }}
    >
      {option.text}
      <span class="count">{option.count}</span>
    </button>
  {/each}
</div>

<style>
  .switch {
    display: inline-flex;
    padding: 0.15rem;
    gap: 0.15rem;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: var(--bg-sunken);
  }

  .option {
    border: 0;
    background: transparent;
    border-radius: 999px;
    padding: 0.2rem 0.65rem;
    font-size: 0.82rem;
    color: var(--text-muted);
    display: inline-flex;
    gap: 0.35rem;
    align-items: center;
  }

  .option:hover {
    color: var(--text);
  }

  .option.active {
    color: var(--text);
    background: var(--bg-raised);
    box-shadow: inset 0 0 0 1px var(--border-strong);
  }

  .count {
    font-variant-numeric: tabular-nums;
    color: var(--text-muted);
    font-size: 0.75rem;
  }

  .option.active .count {
    color: var(--gold);
  }
</style>
