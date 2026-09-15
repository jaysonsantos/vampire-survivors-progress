<script lang="ts">
  import { CATALOG } from "$lib/catalog.ts";
  import GroupFilter from "$lib/components/GroupFilter.svelte";
  import SaveDropzone from "$lib/components/SaveDropzone.svelte";
  import { filterEntries } from "$lib/filter.ts";
  import { saveStore } from "$lib/save/store.svelte.ts";
  import type { Id } from "$lib/types.ts";

  let search = $state("");
  let group = $state<string | null>(null);
  let missing = $state(false);

  const save = $derived(saveStore.current);
  const unlocked = $derived(new Set<Id>(save?.Achievements ?? []));
  const secrets = $derived(new Set<Id>(save?.Secrets ?? []));

  const achievementsHeld = $derived(CATALOG.achievements.filter((entry) => unlocked.has(entry.id)).length);
  const secretsHeld = $derived(CATALOG.secrets.filter((entry) => secrets.has(entry.id)).length);

  const shownAchievements = $derived(filterEntries(CATALOG.achievements, unlocked, { search, group, missing }));
  const shownSecrets = $derived(filterEntries(CATALOG.secrets, secrets, { search, group, missing }));
</script>

<svelte:head><title>Achievements · Vampire Survivors Progress</title></svelte:head>

{#if save === null}
  <SaveDropzone />
{:else}
  <h1>Achievements</h1>

  <div class="toolbar">
    <input type="search" placeholder="Filter achievements" bind:value={search} aria-label="Filter achievements" />
    <GroupFilter bind:value={group} />
    <label class="small"><input type="checkbox" bind:checked={missing} /> Show what is missing</label>
  </div>

  <section class="group">
    <p class="small muted">
      {achievementsHeld} unlocked. This build knows {CATALOG.achievements.length} identifiers, some of which the game
      does not award yet.
    </p>
    <div class="tag-list">
      {#each shownAchievements as entry (entry.id)}
        <span class="tag" class:off={!unlocked.has(entry.id)} title="{entry.id}{entry.group ? ` · ${entry.group}` : ''}">
          {entry.label}
        </span>
      {/each}
    </div>
    {#if shownAchievements.length === 0}
      <p class="small muted">Nothing to show here with the current filter.</p>
    {/if}
  </section>

  <section class="group">
    <h2>Secrets</h2>
    <p class="small muted">{secretsHeld} found of {CATALOG.secrets.length} known identifiers.</p>
    <div class="tag-list">
      {#each shownSecrets as entry (entry.id)}
        <span class="tag" class:off={!secrets.has(entry.id)} title={entry.id}>{entry.label}</span>
      {/each}
    </div>
  </section>
{/if}

<style>
  .group {
    margin-top: 1.5rem;
    display: grid;
    gap: 0.6rem;
  }
</style>
