<script lang="ts">
  import { CATALOG } from "$lib/catalog.ts";
  import EntryTag from "$lib/components/EntryTag.svelte";
  import GroupFilter from "$lib/components/GroupFilter.svelte";
  import SaveDropzone from "$lib/components/SaveDropzone.svelte";
  import SectionHeading from "$lib/components/SectionHeading.svelte";
  import ViewFilter from "$lib/components/ViewFilter.svelte";
  import { countHeld, type EntryView, filterEntries, VIEW } from "$lib/filter.ts";
  import { saveStore } from "$lib/save/store.svelte.ts";
  import type { Id } from "$lib/types.ts";

  let search = $state("");
  let group = $state<string | null>(null);
  let achievementView = $state<EntryView>(VIEW.owned);
  let secretView = $state<EntryView>(VIEW.owned);

  const save = $derived(saveStore.current);
  const unlocked = $derived(new Set<Id>(save?.Achievements ?? []));
  const secrets = $derived(new Set<Id>(save?.Secrets ?? []));

  const achievementsHeld = $derived(countHeld(CATALOG.achievements, unlocked));
  const secretsHeld = $derived(countHeld(CATALOG.secrets, secrets));

  const shownAchievements = $derived(
    filterEntries(CATALOG.achievements, unlocked, { search, group, view: achievementView }),
  );
  const shownSecrets = $derived(filterEntries(CATALOG.secrets, secrets, { search, group, view: secretView }));
</script>

<svelte:head><title>Achievements · Vampire Survivors Progress</title></svelte:head>

{#if save === null}
  <SaveDropzone />
{:else}
  <SectionHeading title="Achievements" level="h1" wiki="achievements" wikiLabel="Full list with conditions" />
  <p class="small muted lead">
    Grey tags are still locked. Each tag searches the wiki for its own name. The wiki achievements page lists every
    condition and reward in one table.
  </p>

  <div class="toolbar">
    <input type="search" placeholder="Filter achievements and secrets" bind:value={search} aria-label="Filter" />
    <GroupFilter bind:value={group} />
  </div>

  <section class="group">
    <SectionHeading title="Achievements" wiki="achievements">
      <ViewFilter
        bind:value={achievementView}
        total={CATALOG.achievements.length}
        owned={achievementsHeld}
        label="Achievements"
      />
    </SectionHeading>
    <p class="small muted">
      The game data defines {CATALOG.achievements.length} achievements across the base game and every add-on. Use the
      content filter to see one add-on. Each tag names what the achievement unlocks.
    </p>
    <div class="tag-list">
      {#each shownAchievements as entry (entry.id)}
        <EntryTag {entry} held={unlocked.has(entry.id)} />
      {/each}
    </div>
    {#if shownAchievements.length === 0}
      <p class="small muted">Nothing to show here with the current filter.</p>
    {/if}
  </section>

  <section class="group">
    <SectionHeading title="Secrets" wiki="secrets">
      <ViewFilter bind:value={secretView} total={CATALOG.secrets.length} owned={secretsHeld} label="Secrets" />
    </SectionHeading>
    <p class="small muted">
      The game data defines {CATALOG.secrets.length} secrets across the base game and every add-on. Each tag names what
      the secret unlocks. Hover a tag to see what it needs first. The wiki explains how to trigger each one.
    </p>
    <div class="tag-list">
      {#each shownSecrets as entry (entry.id)}
        <EntryTag {entry} held={secrets.has(entry.id)} />
      {/each}
    </div>
    {#if shownSecrets.length === 0}
      <p class="small muted">Nothing to show here with the current filter.</p>
    {/if}
  </section>
{/if}

<style>
  .group {
    margin-top: 1.5rem;
    display: grid;
    gap: 0.6rem;
  }
</style>
