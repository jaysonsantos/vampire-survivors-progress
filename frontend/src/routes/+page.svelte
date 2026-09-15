<script lang="ts">
  import { DARKANAS, STANDARD_ARCANAS } from "$lib/catalog.ts";
  import CountCard from "$lib/components/CountCard.svelte";
  import SaveDropzone from "$lib/components/SaveDropzone.svelte";
  import SectionHeading from "$lib/components/SectionHeading.svelte";
  import StatCard from "$lib/components/StatCard.svelte";
  import TallyCard from "$lib/components/TallyCard.svelte";
  import WikiLink from "$lib/components/WikiLink.svelte";
  import { formatCount, formatSeconds } from "$lib/save/format.ts";
  import { overview, topKills } from "$lib/save/stats.ts";
  import { saveStore } from "$lib/save/store.svelte.ts";
  import { wikiPageUrl, wikiSearchUrl } from "$lib/wiki.ts";

  const TOP_KILL_ROWS = 12;

  const save = $derived(saveStore.current);
  const summary = $derived(save === null ? null : overview(save, STANDARD_ARCANAS, DARKANAS));
  const kills = $derived(save === null ? [] : topKills(save, TOP_KILL_ROWS));
</script>

<svelte:head><title>Overview · Vampire Survivors Progress</title></svelte:head>

{#if save === null || summary === null}
  <section class="hero">
    <p class="eyebrow small">Fan tool · offline · free</p>
    <h1>See how far you got</h1>
    <p class="muted">
      Load the save file that Vampire Survivors writes. You get your characters, stages, collection, and achievements,
      with a link to the wiki for everything you still have to unlock.
    </p>
    <div class="hero-links">
      <WikiLink href={wikiPageUrl("unlocks")} label="Every unlock condition" kind="pill" />
      <WikiLink href={wikiPageUrl("characters")} label="Characters" kind="pill" />
      <WikiLink href={wikiPageUrl("stages")} label="Stages" kind="pill" />
    </div>
  </section>
  <SaveDropzone />
{:else}
  <SectionHeading title={save.saveName ?? "Save"} level="h1" wiki="unlocks" wikiLabel="How to unlock things">
    <span class="small muted">Platform: {save.Platform ?? "unknown"}</span>
  </SectionHeading>

  <div class="section">
    <SectionHeading title="Completion" />
    <p class="small muted lead">
      Each number below compares your save against a fixed list, so the percentage is exact.
    </p>
    <section class="grid">
      <TallyCard label="Arcanas" tally={summary.standardArcanas} wiki="arcanas" />
      <TallyCard label="Darkanas" tally={summary.darkanas} wiki="arcanas" />
      <TallyCard label="Power-up types bought" tally={summary.powerUps} wiki="powerUps" />
      <TallyCard label="Unlocked stages cleared" tally={summary.stagesCleared} wiki="stages" />
      <TallyCard label="Unlocked stages with hyper" tally={summary.hypersUnlocked} wiki="stages" />
    </section>
  </div>

  <div class="section">
    <SectionHeading title="Unlocked" wiki="unlocks" wikiLabel="Unlock conditions" />
    <p class="small muted lead">
      The game ships no public content list, so the second number is what this build knows. Characters, weapons, and
      items include bosses and content that the game does not award yet. Achievements and secrets come from the game
      data tables and include every add-on, so treat all of them as an upper bound, not a target.
    </p>
    <section class="grid">
      <CountCard label="Characters" tally={summary.characters} wiki="characters" />
      <CountCard label="Weapons" tally={summary.weapons} wiki="weapons" />
      <CountCard label="Items" tally={summary.items} wiki="items" />
      <CountCard label="Achievements" tally={summary.achievements} wiki="achievements" hint="defined by the game" />
      <CountCard label="Secrets" tally={summary.secrets} wiki="secrets" hint="defined by the game" />
      <StatCard label="Stages" value={formatCount(summary.unlockedStages)} />
    </section>
  </div>

  <div class="section">
    <SectionHeading title="Lifetime" />
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
  </div>

  <div class="section">
    <SectionHeading title="Most killed enemies" wiki="enemies" wikiLabel="Bestiary" />
    <div class="table-scroll">
      <table>
        <thead>
          <tr><th>Enemy</th><th class="num">Killed</th></tr>
        </thead>
        <tbody>
          {#each kills as row (row.id)}
            <tr>
              <td class="name">
                <a href={wikiSearchUrl(row.label)} target="_blank" rel="noopener noreferrer">{row.label}</a>
              </td>
              <td class="num">{formatCount(row.count)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
{/if}

<style>
  .hero {
    padding: 2.5rem 0 1.5rem;
    max-width: 62ch;
  }

  .eyebrow {
    color: var(--gold);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin: 0 0 0.4rem;
  }

  .hero h1 {
    font-size: clamp(2rem, 4vw, 3rem);
    background: linear-gradient(90deg, var(--text), var(--accent-soft));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .hero-links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 1rem;
  }
</style>
