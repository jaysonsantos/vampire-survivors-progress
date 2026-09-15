<script lang="ts">
  import { DARKANAS, STANDARD_ARCANAS } from "$lib/catalog.ts";
  import CountCard from "$lib/components/CountCard.svelte";
  import SaveDropzone from "$lib/components/SaveDropzone.svelte";
  import StatCard from "$lib/components/StatCard.svelte";
  import TallyCard from "$lib/components/TallyCard.svelte";
  import { formatCount, formatSeconds } from "$lib/save/format.ts";
  import { overview, topKills } from "$lib/save/stats.ts";
  import { saveStore } from "$lib/save/store.svelte.ts";

  const TOP_KILL_ROWS = 12;

  const save = $derived(saveStore.current);
  const summary = $derived(save === null ? null : overview(save, STANDARD_ARCANAS, DARKANAS));
  const kills = $derived(save === null ? [] : topKills(save, TOP_KILL_ROWS));
</script>

<svelte:head><title>Overview · Vampire Survivors Progress</title></svelte:head>

{#if save === null || summary === null}
  <h1>See how far you got</h1>
  <p class="muted">
    This page reads the save file that Vampire Survivors writes and shows your characters, stages, collection, and
    achievements.
  </p>
  <SaveDropzone />
{:else}
  <h1>{save.saveName ?? "Save"}</h1>
  <p class="muted small">Platform: {save.Platform ?? "unknown"}</p>

  <h2 class="section">Completion</h2>
  <p class="small muted lead">
    These four compare your save against a fixed list, so the percentage is exact.
  </p>
  <section class="grid">
    <TallyCard label="Arcanas" tally={summary.standardArcanas} />
    <TallyCard label="Darkanas" tally={summary.darkanas} />
    <TallyCard label="Power-up types bought" tally={summary.powerUps} />
    <TallyCard label="Unlocked stages cleared" tally={summary.stagesCleared} />
    <TallyCard label="Unlocked stages with hyper" tally={summary.hypersUnlocked} />
  </section>

  <h2 class="section">Unlocked</h2>
  <p class="small muted lead">
    The game ships no public content list, so the second number is what this build knows. It holds bosses and content
    that the game does not award yet, so treat it as an upper bound, not a target.
  </p>
  <section class="grid">
    <CountCard label="Characters" tally={summary.characters} />
    <CountCard label="Weapons" tally={summary.weapons} />
    <CountCard label="Items" tally={summary.items} />
    <CountCard label="Achievements" tally={summary.achievements} />
    <CountCard label="Secrets" tally={summary.secrets} />
    <StatCard label="Stages" value={formatCount(summary.unlockedStages)} />
  </section>

  <h2 class="section">Lifetime</h2>
  <section class="grid">
    <StatCard label="Coins now" value={formatCount(save.Coins)} />
    <StatCard label="Coins earned" value={formatCount(save.LifetimeCoins)} />
    <StatCard label="Time survived" value={formatSeconds(save.LifetimeSurvived)} />
    <StatCard label="Enemies killed" value={formatCount(summary.totalKills)} />
    <StatCard label="Runs started" value={formatCount(summary.totalRuns)} />
    <StatCard label="Stage clears" value={formatCount(summary.stageClears)} />
    <StatCard label="Health healed" value={formatCount(save.LifetimeHeal)} />
    <StatCard label="Seals" value={formatCount(save.Seals)} />
    <StatCard
      label="Final boss"
      value={save.HasKilledTheFinalBoss === true ? "Defeated" : "Alive"}
      hint="Eudaimonia Machine"
    />
  </section>

  <h2 class="section">Most killed enemies</h2>
  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Enemy</th><th class="num">Killed</th></tr>
      </thead>
      <tbody>
        {#each kills as row (row.id)}
          <tr><td>{row.label}</td><td class="num">{formatCount(row.count)}</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}

<style>
  .section {
    margin-top: 1.75rem;
  }

  .lead {
    margin: -0.25rem 0 0.75rem;
    max-width: 62ch;
  }
</style>
