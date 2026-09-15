<script lang="ts">
  import SaveDropzone from "$lib/components/SaveDropzone.svelte";
  import SectionHeading from "$lib/components/SectionHeading.svelte";
  import WikiLink from "$lib/components/WikiLink.svelte";
  import { MIN_SEARCH_LENGTH } from "$lib/constants.ts";
  import { formatCount, formatMinutes } from "$lib/save/format.ts";
  import { characterRows } from "$lib/save/stats.ts";
  import { saveStore } from "$lib/save/store.svelte.ts";
  import { wikiSearchUrl } from "$lib/wiki.ts";

  let search = $state("");
  let onlyUnlocked = $state(true);

  const save = $derived(saveStore.current);
  const rows = $derived(save === null ? [] : characterRows(save));
  const shown = $derived(
    rows.filter((row) => {
      if (onlyUnlocked && !row.unlocked) return false;
      if (search.trim().length < MIN_SEARCH_LENGTH) return true;
      return row.label.toLowerCase().includes(search.trim().toLowerCase());
    }),
  );
</script>

<svelte:head><title>Characters · Vampire Survivors Progress</title></svelte:head>

{#if save === null}
  <SaveDropzone />
{:else}
  <SectionHeading title="Characters" level="h1" wiki="characters" wikiLabel="All characters and unlocks" />

  <div class="toolbar">
    <input type="search" placeholder="Filter characters" bind:value={search} aria-label="Filter characters" />
    <label class="small"><input type="checkbox" bind:checked={onlyUnlocked} /> Unlocked only</label>
    <span class="spacer"></span>
    <span class="small muted">{shown.length} of {rows.length}</span>
  </div>

  <div class="table-scroll">
    <table>
      <thead>
        <tr>
          <th>Character</th>
          <th class="num">Survived</th>
          <th class="num">Killed</th>
          <th class="num">Stages cleared</th>
          <th class="num">Stages played</th>
          <th class="num">Egg bonus</th>
          <th class="num">Skins</th>
          <th>State</th>
          <th>Wiki</th>
        </tr>
      </thead>
      <tbody>
        {#each shown as row (row.id)}
          <tr class:locked={!row.unlocked}>
            <td class="name">
              <a href={wikiSearchUrl(row.label)} target="_blank" rel="noopener noreferrer" title={row.id}>{row.label}</a>
            </td>
            <td class="num">{formatMinutes(row.survivedMinutes)}</td>
            <td class="num">{formatCount(row.enemiesKilled)}</td>
            <td class="num">{row.stagesCompleted}</td>
            <td class="num">{row.stagesPlayed}</td>
            <td class="num">{row.hasEgg ? formatCount(row.eggTotal) : "—"}</td>
            <td class="num">{row.skins > 0 ? row.skins : "—"}</td>
            <td>
              <span class="tag" class:good={row.unlocked} class:off={!row.unlocked}>
                {row.unlocked ? "Unlocked" : "Locked"}
              </span>
              {#if row.bought}<span class="tag gold">Bought</span>{/if}
            </td>
            <td>
              <WikiLink href={wikiSearchUrl(row.label)} label={row.unlocked ? "Details" : "How to unlock"} kind="pill" />
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if shown.length === 0}
    <p class="muted">No character matches that filter.</p>
  {/if}
{/if}

<style>
  tr.locked td.name a {
    color: var(--text-muted);
  }
</style>
