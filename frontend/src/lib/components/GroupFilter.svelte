<script lang="ts">
  import { GROUP_NAMES } from "../catalog.ts";
  import { BASE_GAME } from "../filter.ts";

  interface Props {
    /** `null` means every group, including the base game. */
    value: string | null;
  }

  let { value = $bindable() }: Props = $props();
</script>

<label class="small">
  Content
  <select bind:value aria-label="Filter by content group">
    <option value={null}>Everything</option>
    <option value={BASE_GAME}>{BASE_GAME}</option>
    {#each GROUP_NAMES as name (name)}
      <option value={name}>{name}</option>
    {/each}
  </select>
</label>

<style>
  label {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--text-muted);
  }

  select {
    font: inherit;
    color: var(--text);
    background: var(--bg-sunken);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0.35rem 0.5rem;
  }
</style>
