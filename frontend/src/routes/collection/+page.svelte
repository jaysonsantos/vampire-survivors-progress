<script lang="ts">
  import { CATALOG, DARKANAS, STANDARD_ARCANAS } from "$lib/catalog.ts";
  import GroupFilter from "$lib/components/GroupFilter.svelte";
  import ProgressBar from "$lib/components/ProgressBar.svelte";
  import SaveDropzone from "$lib/components/SaveDropzone.svelte";
  import { filterEntries } from "$lib/filter.ts";
  import { powerUpRanks, unlockedArcanas } from "$lib/save/stats.ts";
  import { saveStore } from "$lib/save/store.svelte.ts";
  import type { CatalogEntry, Id } from "$lib/types.ts";

  let search = $state("");
  let group = $state<string | null>(null);
  let missing = $state(false);

  const save = $derived(saveStore.current);
  const heldWeapons = $derived(new Set<Id>(save?.UnlockedWeapons ?? []));
  const heldItems = $derived(new Set<Id>(save?.CollectedItems ?? []));
  const heldArcanas = $derived(new Set<Id>(unlockedArcanas(save ?? {}).map((entry) => entry.id)));
  const ranks = $derived(save === null ? [] : powerUpRanks(save));

  const GROUPS = $derived([
    { key: "weapons", title: "Weapons", entries: CATALOG.weapons, held: heldWeapons, exact: false },
    { key: "items", title: "Items", entries: CATALOG.items, held: heldItems, exact: false },
    { key: "arcanas", title: "Arcanas", entries: STANDARD_ARCANAS, held: heldArcanas, exact: true },
    { key: "darkanas", title: "Darkanas", entries: DARKANAS, held: heldArcanas, exact: true },
  ]);

  function shown(entries: CatalogEntry[], held: Set<Id>): CatalogEntry[] {
    return filterEntries(entries, held, { search, group, missing });
  }
</script>

<svelte:head><title>Collection · Vampire Survivors Progress</title></svelte:head>

{#if save === null}
  <SaveDropzone />
{:else}
  <h1>Collection</h1>

  <div class="toolbar">
    <input type="search" placeholder="Filter the collection" bind:value={search} aria-label="Filter the collection" />
    <GroupFilter bind:value={group} />
    <label class="small"><input type="checkbox" bind:checked={missing} /> Show what is missing</label>
  </div>

  <section class="card">
    <h2>Power-up ranks bought</h2>
    <div class="rank-grid">
      {#each ranks as rank (rank.id)}
        <div class="rank">
          <span>{rank.label}</span>
          <span class="muted">{rank.rank}</span>
        </div>
      {/each}
    </div>
  </section>

  {#each GROUPS as section (section.key)}
    {@const entries = shown(section.entries, section.held)}
    {@const held = section.entries.filter((entry) => section.held.has(entry.id)).length}
    <section class="group">
      <h2>{section.title}</h2>
      {#if section.exact}
        <ProgressBar part={held} total={section.entries.length} label="{section.title} unlocked" />
      {:else}
        <p class="small muted">
          {held} unlocked. This build knows {section.entries.length} identifiers, which is an upper bound.
        </p>
      {/if}
      <div class="tag-list">
        {#each entries as entry (entry.id)}
          <span class="tag" class:off={!section.held.has(entry.id)} title="{entry.id}{entry.group ? ` · ${entry.group}` : ''}">
            {entry.label}
          </span>
        {/each}
      </div>
      {#if entries.length === 0}
        <p class="small muted">Nothing to show here with the current filter.</p>
      {/if}
    </section>
  {/each}
{/if}

<style>
  .group {
    margin-top: 1.75rem;
    display: grid;
    gap: 0.6rem;
  }

  .rank-grid {
    display: grid;
    gap: 0.3rem 1rem;
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    font-size: 0.9rem;
  }

  .rank {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid var(--border);
    padding: 0.15rem 0;
  }
</style>
