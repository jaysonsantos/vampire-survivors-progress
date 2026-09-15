<script lang="ts">
  import SaveDropzone from "$lib/components/SaveDropzone.svelte";
  import { MIN_SEARCH_LENGTH } from "$lib/constants.ts";
  import { formatCount, formatMinutes } from "$lib/save/format.ts";
  import { characterRows } from "$lib/save/stats.ts";
  import { saveStore } from "$lib/save/store.svelte.ts";

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
  <h1>Characters</h1>

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
        </tr>
      </thead>
      <tbody>
        {#each shown as row (row.id)}
          <tr>
            <td>{row.label}</td>
            <td class="num">{formatMinutes(row.survivedMinutes)}</td>
            <td class="num">{formatCount(row.enemiesKilled)}</td>
            <td class="num">{row.stagesCompleted}</td>
            <td class="num">{row.stagesPlayed}</td>
            <td class="num">{row.hasEgg ? formatCount(row.eggTotal) : "—"}</td>
            <td class="num">{row.skins > 0 ? row.skins : "—"}</td>
            <td>
              <span class="tag" class:off={!row.unlocked}>{row.unlocked ? "Unlocked" : "Locked"}</span>
              {#if row.bought}<span class="tag">Bought</span>{/if}
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
