/** Turns a raw save into the rows and tallies that the pages show. */
import { arcanaByValue, CATALOG, labelFor } from "../catalog.ts";
import { COMPLETE_THRESHOLD } from "../constants.ts";
import type { CatalogEntry, CharacterProgress, Id, SaveData, StageProgress, StageRecord, Tally } from "../types.ts";

// region: helpers

function list(value: Id[] | undefined): Id[] {
  return value ?? [];
}

function map<T>(value: Record<Id, T> | undefined): Record<Id, T> {
  return value ?? {};
}

function sum(values: Iterable<number>): number {
  let total = 0;
  for (const value of values) total += value;
  return total;
}

/** Counts owned identifiers against the identifiers this build knows about. */
export function tally(owned: Iterable<Id>, known: CatalogEntry[]): Tally {
  const knownIds = new Set(known.map((entry) => entry.id));
  const unique = new Set<Id>();
  for (const id of owned) {
    if (knownIds.has(id)) unique.add(id);
  }
  return { owned: unique.size, known: knownIds.size };
}

// endregion: helpers

// region: characters

/** Every character the save mentions, richest rows first. */
export function characterRows(save: SaveData): CharacterProgress[] {
  const unlocked = new Set(list(save.UnlockedCharacters));
  const bought = new Set(list(save.BoughtCharacters));
  const coffins = new Set(list(save.OpenedCoffins));
  const stageData = map<StageRecord[]>(save.CharacterStageData);
  const survived = map<number>(save.CharacterSurvivedMinutes);
  const killed = map<number>(save.CharacterEnemiesKilled);
  const eggs = map<Record<string, number>>(save.EggData);
  const skins = map<Id[]>(save.UnlockedSkinsV2);

  const ids = new Set<Id>([
    ...unlocked,
    ...bought,
    ...coffins,
    ...Object.keys(stageData),
    ...Object.keys(survived),
    ...Object.keys(eggs),
  ]);

  const rows: CharacterProgress[] = [];
  for (const id of ids) {
    const records = stageData[id] ?? [];
    const egg = eggs[id];
    rows.push({
      id,
      label: labelFor(id),
      unlocked: unlocked.has(id) || coffins.has(id),
      bought: bought.has(id),
      survivedMinutes: survived[id] ?? 0,
      enemiesKilled: killed[id] ?? 0,
      stagesCompleted: records.filter((record) => record.complete >= COMPLETE_THRESHOLD).length,
      stagesPlayed: records.length,
      hasEgg: egg !== undefined,
      eggTotal: egg?.total ?? 0,
      skins: (skins[id] ?? []).length,
    });
  }

  rows.sort((left, right) => right.survivedMinutes - left.survivedMinutes || left.label.localeCompare(right.label));
  return rows;
}

// endregion: characters

// region: stages

/** Every stage the save mentions, most played first. */
export function stageRows(save: SaveData): StageProgress[] {
  const unlocked = new Set(list(save.UnlockedStages));
  const hypers = new Set(list(save.UnlockedHypers));
  const stageData = map<StageRecord[]>(save.CharacterStageData);

  const byStage = new Map<Id, StageRecord[]>();
  for (const records of Object.values(stageData)) {
    for (const record of records) {
      const bucket = byStage.get(record.type);
      if (bucket === undefined) byStage.set(record.type, [record]);
      else bucket.push(record);
    }
  }

  const ids = new Set<Id>([...unlocked, ...hypers, ...byStage.keys()]);
  const rows: StageProgress[] = [];
  for (const id of ids) {
    const records = byStage.get(id) ?? [];
    rows.push({
      id,
      label: labelFor(id),
      unlocked: unlocked.has(id),
      hyperUnlocked: hypers.has(id),
      charactersCompleted: records.filter((record) => record.complete >= COMPLETE_THRESHOLD).length,
      charactersPlayed: records.length,
      bestSurvivedMinutes: records.reduce((best, record) => Math.max(best, record.survivedMinutes), 0),
      totalRuns: sum(records.map((record) => record.startedRun)),
    });
  }

  rows.sort((left, right) => right.totalRuns - left.totalRuns || left.label.localeCompare(right.label));
  return rows;
}

/** The character-by-stage completion grid. */
export function completionMatrix(save: SaveData): {
  stages: Id[];
  rows: { character: Id; label: string; cells: (StageRecord | undefined)[] }[];
} {
  const characters = characterRows(save).filter((row) => row.stagesPlayed > 0);
  const stages = stageRows(save)
    .filter((row) => row.charactersPlayed > 0)
    .map((row) => row.id);
  const stageData = map<StageRecord[]>(save.CharacterStageData);

  const rows = characters.map((character) => {
    const byType = new Map((stageData[character.id] ?? []).map((record) => [record.type, record]));
    return { character: character.id, label: character.label, cells: stages.map((stage) => byType.get(stage)) };
  });

  return { stages, rows };
}

// endregion: stages

// region: collection

/** The arcana cards the save unlocked, resolved from their enum numbers. */
export function unlockedArcanas(save: SaveData): CatalogEntry[] {
  const entries: CatalogEntry[] = [];
  for (const value of save.UnlockedArcanas ?? []) {
    const entry = arcanaByValue(value);
    if (entry !== undefined) entries.push(entry);
  }
  entries.sort((left, right) => (left.value ?? 0) - (right.value ?? 0));
  return entries;
}

/** How many of each power-up the player bought. */
export function powerUpRanks(save: SaveData): { id: Id; label: string; rank: number }[] {
  const counts = new Map<Id, number>();
  for (const id of list(save.BoughtPowerups)) counts.set(id, (counts.get(id) ?? 0) + 1);
  const rows = [...counts].map(([id, rank]) => ({ id, label: labelFor(id), rank }));
  rows.sort((left, right) => right.rank - left.rank || left.label.localeCompare(right.label));
  return rows;
}

/** The enemies the player killed most. */
export function topKills(save: SaveData, limit: number): { id: Id; label: string; count: number }[] {
  const rows = Object.entries(map<number>(save.KillCount)).map(([id, count]) => ({
    id,
    label: labelFor(id),
    count,
  }));
  rows.sort((left, right) => right.count - left.count);
  return rows.slice(0, limit);
}

// endregion: collection

// region: overview

export interface Overview {
  /**
   * Counts of owned identifiers. `known` is how many identifiers this build
   * knows, which includes bosses and unreleased content, so it is an upper
   * bound and not a completion target.
   */
  characters: Tally;
  weapons: Tally;
  items: Tally;
  achievements: Tally;
  secrets: Tally;

  /** Exact ratios: the save holds both sides of these. */
  standardArcanas: Tally;
  darkanas: Tally;
  powerUps: Tally;
  stagesCleared: Tally;
  hypersUnlocked: Tally;

  unlockedStages: number;
  totalKills: number;
  totalRuns: number;
  stageClears: number;
}

/** The headline numbers of the overview page. */
export function overview(save: SaveData, standardArcanas: CatalogEntry[], darkanas: CatalogEntry[]): Overview {
  const stageData = map<StageRecord[]>(save.CharacterStageData);
  const records = Object.values(stageData).flat();
  const arcanaIds = new Set(unlockedArcanas(save).map((entry) => entry.id));

  const unlockedStages = new Set(list(save.UnlockedStages));
  const clearedStages = new Set(
    stageRows(save)
      .filter((row) => row.charactersCompleted > 0 && unlockedStages.has(row.id))
      .map((row) => row.id),
  );
  const hypers = new Set(list(save.UnlockedHypers));

  return {
    characters: tally([...list(save.UnlockedCharacters), ...list(save.OpenedCoffins)], CATALOG.characters),
    weapons: tally(list(save.UnlockedWeapons), CATALOG.weapons),
    items: tally(list(save.CollectedItems), CATALOG.items),
    achievements: tally(list(save.Achievements), CATALOG.achievements),
    secrets: tally(list(save.Secrets), CATALOG.secrets),

    standardArcanas: tally(arcanaIds, standardArcanas),
    darkanas: tally(arcanaIds, darkanas),
    powerUps: tally(new Set(list(save.BoughtPowerups)), CATALOG.powerUps),
    stagesCleared: { owned: clearedStages.size, known: unlockedStages.size },
    hypersUnlocked: { owned: [...hypers].filter((id) => unlockedStages.has(id)).length, known: unlockedStages.size },

    unlockedStages: unlockedStages.size,
    totalKills: sum(Object.values(map<number>(save.KillCount))),
    totalRuns: sum(records.map((record) => record.startedRun)),
    stageClears: sum(records.map((record) => record.complete)),
  };
}

// endregion: overview
