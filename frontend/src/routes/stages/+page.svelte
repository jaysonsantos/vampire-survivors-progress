<script lang="ts">
  import { labelFor } from "$lib/catalog.ts";
  import SaveDropzone from "$lib/components/SaveDropzone.svelte";
  import SectionHeading from "$lib/components/SectionHeading.svelte";
  import WikiLink from "$lib/components/WikiLink.svelte";
  import { COMPLETE_THRESHOLD } from "$lib/constants.ts";
  import { formatCount, formatMinutes } from "$lib/save/format.ts";
  import { completionMatrix, stageRows } from "$lib/save/stats.ts";
  import { saveStore } from "$lib/save/store.svelte.ts";
  import { wikiSearchUrl } from "$lib/wiki.ts";

  let showMatrix = $state(false);

  const save = $derived(saveStore.current);
  const rows = $derived(save === null ? [] : stageRows(save));
  const matrix = $derived(save === null ? { stages: [], rows: [] } : completionMatrix(save));
</script>

<svelte:head><title>Stages · Vampire Survivors Progress</title></svelte:head>

{#if save === null}
  <SaveDropzone />
{:else}
  <SectionHeading title="Stages" level="h1" wiki="stages" wikiLabel="All stages and unlocks" />

  <div class="toolbar">
    <label class="small"><input type="checkbox" bind:checked={showMatrix} /> Show the character grid</label>
    <span class="spacer"></span>
    <span class="small muted">{rows.length} stages</span>
  </div>

  {#if showMatrix}
    <p class="small muted legend">
      <span class="tag good">✓ cleared</span>
      <span class="tag">· played, not cleared</span>
      <span class="tag off">blank: never started</span>
    </p>
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th class="sticky-col">Character</th>
            {#each matrix.stages as stage (stage)}
              <th class="tight">{labelFor(stage)}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each matrix.rows as row (row.character)}
            <tr>
              <td class="sticky-col name">{row.label}</td>
              {#each row.cells as cell, index (matrix.stages[index])}
                <td class="cell" class:done={(cell?.complete ?? 0) >= COMPLETE_THRESHOLD}>
                  {#if cell === undefined}
                    &nbsp;
                  {:else if cell.complete >= COMPLETE_THRESHOLD}
                    ✓
                  {:else}
                    ·
                  {/if}
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Stage</th>
            <th class="num">Characters cleared</th>
            <th class="num">Characters played</th>
            <th class="num">Best survived</th>
            <th class="num">Runs</th>
            <th>State</th>
            <th>Wiki</th>
          </tr>
        </thead>
        <tbody>
          {#each rows as row (row.id)}
            <tr>
              <td class="name">
                <a href={wikiSearchUrl(row.label)} target="_blank" rel="noopener noreferrer" title={row.id}>
                  {row.label}
                </a>
              </td>
              <td class="num">{row.charactersCompleted}</td>
              <td class="num">{row.charactersPlayed}</td>
              <td class="num">{formatMinutes(row.bestSurvivedMinutes)}</td>
              <td class="num">{formatCount(row.totalRuns)}</td>
              <td>
                <span class="tag" class:good={row.unlocked} class:off={!row.unlocked}>
                  {row.unlocked ? "Unlocked" : "Locked"}
                </span>
                {#if row.hyperUnlocked}<span class="tag gold">Hyper</span>{/if}
              </td>
              <td>
                <WikiLink
                  href={wikiSearchUrl(row.label)}
                  label={row.unlocked && row.hyperUnlocked ? "Details" : "How to unlock"}
                  kind="pill"
                />
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
{/if}

<style>
  .legend {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .sticky-col {
    position: sticky;
    left: 0;
    background: var(--bg-raised);
    z-index: 2;
  }

  thead .sticky-col {
    background: var(--bg-sunken);
    z-index: 3;
  }

  th.tight {
    font-size: 0.72rem;
    text-transform: none;
    letter-spacing: 0;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    height: 8.5rem;
    padding: 0.3rem 0.15rem;
  }

  td.cell {
    text-align: center;
    color: var(--text-muted);
    padding: 0.35rem 0.25rem;
  }

  td.cell.done {
    color: var(--good);
    font-weight: 700;
  }
</style>
