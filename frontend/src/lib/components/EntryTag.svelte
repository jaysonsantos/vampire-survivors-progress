<script lang="ts">
  import { labelFor } from "../catalog.ts";
  import type { CatalogEntry, RewardKind } from "../types.ts";
  import { wikiEntryUrl } from "../wiki.ts";

  interface Props {
    entry: CatalogEntry;
    held: boolean;
  }

  let { entry, held }: Props = $props();

  /** Short words for what a reward is, shown before its name. */
  const KIND_WORDS: Record<RewardKind, string> = {
    character: "character",
    weapon: "weapon",
    stage: "stage",
    hyper: "hyper",
    relic: "relic",
    arcana: "arcana",
    powerUp: "power-up",
    skin: "skin",
  };

  const rewards = $derived(entry.rewards ?? []);
  const requires = $derived(entry.requires ?? []);

  const tooltip = $derived(
    [
      entry.id,
      entry.group,
      entry.spell === true ? "Typed as a code" : null,
      rewards.length > 0 ? `Unlocks ${rewards.map((r) => `${KIND_WORDS[r.kind]} ${labelFor(r.id)}`).join(", ")}` : null,
      requires.length > 0 ? `Needs ${requires.map((id) => labelFor(id)).join(", ")}` : null,
      held ? "Open on the wiki" : "Locked. How to unlock, on the wiki",
    ]
      .filter((part): part is string => part !== null)
      .join(" · "),
  );
</script>

<a
  class="tag entry"
  class:off={!held}
  href={wikiEntryUrl(entry)}
  target="_blank"
  rel="noopener noreferrer"
  title={tooltip}
>
  <span class="dot" aria-hidden="true"></span>
  {entry.label}
  {#if rewards.length > 0}
    <span class="reward">
      {#each rewards as reward, index (`${reward.kind}:${reward.id}`)}
        {#if index > 0}, {/if}<span class="kind">{KIND_WORDS[reward.kind]}</span> {labelFor(reward.id)}
      {/each}
    </span>
  {/if}
</a>

<style>
  .entry {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--text);
    text-decoration: none;
    transition:
      border-color 120ms ease,
      transform 120ms ease;
  }

  .entry:hover {
    border-color: var(--accent);
    transform: translateY(-1px);
  }

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--good);
    flex: none;
  }

  .off .dot {
    background: var(--border-strong);
  }

  .reward {
    color: var(--gold);
    border-left: 1px solid var(--border-strong);
    padding-left: 0.4rem;
  }

  .kind {
    color: var(--text-muted);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
</style>
