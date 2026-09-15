<script lang="ts">
  import { CATALOG, DARKANAS, STANDARD_ARCANAS } from "$lib/catalog.ts";
  import EntryTag from "$lib/components/EntryTag.svelte";
  import GroupFilter from "$lib/components/GroupFilter.svelte";
  import ProgressBar from "$lib/components/ProgressBar.svelte";
  import SaveDropzone from "$lib/components/SaveDropzone.svelte";
  import SectionHeading from "$lib/components/SectionHeading.svelte";
  import ViewFilter from "$lib/components/ViewFilter.svelte";
  import { countHeld, type EntryView, filterEntries, VIEW } from "$lib/filter.ts";
  import { powerUpRanks, unlockedArcanas } from "$lib/save/stats.ts";
  import { saveStore } from "$lib/save/store.svelte.ts";
  import type { CatalogEntry, Id } from "$lib/types.ts";
  import type { WikiPage } from "$lib/wiki.ts";

  let search = $state("");
  let group = $state<string | null>(null);
  let view = $state<EntryView>(VIEW.owned);

  const save = $derived(saveStore.current);
  const heldWeapons = $derived(new Set<Id>(save?.UnlockedWeapons ?? []));
  const heldItems = $derived(new Set<Id>(save?.CollectedItems ?? []));
  const heldArcanas = $derived(new Set<Id>(unlockedArcanas(save ?? {}).map((entry) => entry.id)));
  const ranks = $derived(save === null ? [] : powerUpRanks(save));

  interface Group {
    key: string;
    title: string;
    entries: CatalogEntry[];
    held: Set<Id>;
    /** `true` when the list is fixed, so a percentage is honest. */
    exact: boolean;
    wiki: WikiPage;
  }

  const GROUPS: Group[] = $derived([
    { key: "weapons", title: "Weapons", entries: CATALOG.weapons, held: heldWeapons, exact: false, wiki: "weapons" },
    { key: "items", title: "Items", entries: CATALOG.items, held: heldItems, exact: false, wiki: "items" },
    { key: "arcanas", title: "Arcanas", entries: STANDARD_ARCANAS, held: heldArcanas, exact: true, wiki: "arcanas" },
    { key: "darkanas", title: "Darkanas", entries: DARKANAS, held: heldArcanas, exact: true, wiki: "arcanas" },
  ]);

  const totalEntries = $derived(GROUPS.reduce((total, section) => total + section.entries.length, 0));
  const totalHeld = $derived(GROUPS.reduce((total, section) => total + countHeld(section.entries, section.held), 0));

  function shown(entries: CatalogEntry[], held: Set<Id>): CatalogEntry[] {
    return filterEntries(entries, held, { search, group, view });
  }
</script>

<svelte:head><title>Collection · Vampire Survivors Progress</title></svelte:head>

{#if save === null}
  <SaveDropzone />
{:else}
  <SectionHeading title="Collection" level="h1" wiki="unlocks" wikiLabel="How to unlock things" />
  <p class="small muted lead">Every tag links to the wiki. Grey tags are still locked: the wiki page tells you how.</p>

  <div class="toolbar">
    <input type="search" placeholder="Filter the collection" bind:value={search} aria-label="Filter the collection" />
    <GroupFilter bind:value={group} />
    <ViewFilter bind:value={view} total={totalEntries} owned={totalHeld} label="Collection" />
  </div>

  <section class="card">
    <SectionHeading title="Power-up ranks bought" wiki="powerUps" />
    <div class="rank-grid">
      {#each ranks as rank (rank.id)}
        <div class="rank">
          <span>{rank.label}</span>
          <span class="rank-value">{rank.rank}</span>
        </div>
      {/each}
    </div>
  </section>

  {#each GROUPS as section (section.key)}
    {@const entries = shown(section.entries, section.held)}
    {@const held = countHeld(section.entries, section.held)}
    <section class="group">
      <SectionHeading title={section.title} wiki={section.wiki} />
      {#if section.exact}
        <ProgressBar part={held} total={section.entries.length} label="{section.title} unlocked" />
      {:else}
        <p class="small muted">
          {held} unlocked. This build knows {section.entries.length} identifiers, which is an upper bound.
        </p>
      {/if}
      <div class="tag-list">
        {#each entries as entry (entry.id)}
          <EntryTag {entry} held={section.held.has(entry.id)} />
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
    margin-top: 2rem;
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

  .rank-value {
    color: var(--gold);
    font-variant-numeric: tabular-nums;
    font-weight: 600;
  }
</style>
