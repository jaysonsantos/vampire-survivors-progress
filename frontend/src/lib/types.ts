/** Shapes of the game save file and of the identifier catalog. */

/** Every identifier in the save is a plain string enum member. */
export type Id = string;

/** One enum member of the game, with a label derived from its identifier. */
export interface CatalogEntry {
  id: Id;
  label: string;
  value: number | null;
  /** The add-on the entry belongs to, or `null` for the base game. */
  group: string | null;
}

/** One character-and-stage record inside `CharacterStageData`. */
export interface StageRecord {
  type: Id;
  complete: number;
  hyper: boolean;
  hurry: boolean;
  inverse: boolean;
  survivedMinutes: number;
  startedRun: number;
}

/** The bonuses that a golden egg added to one character. */
export type EggBonuses = Record<string, number>;

/**
 * The fields of the save that this app reads. The game writes many more; the
 * reader keeps them untouched and ignores them.
 */
export interface SaveData {
  saveName?: string;
  saveIcon?: Id;
  Platform?: string;
  Coins?: number;
  LifetimeCoins?: number;
  TotalCoins?: number;
  LifetimeSurvived?: number;
  LifetimeHeal?: number;
  Seals?: number;
  HasKilledTheFinalBoss?: boolean;

  BoughtCharacters?: Id[];
  UnlockedCharacters?: Id[];
  OpenedCoffins?: Id[];
  CollectedWeapons?: Id[];
  UnlockedWeapons?: Id[];
  CollectedItems?: Id[];
  Achievements?: Id[];
  Secrets?: Id[];
  UnlockedStages?: Id[];
  UnlockedHypers?: Id[];
  UnlockedArcanas?: number[];
  BoughtPowerups?: Id[];
  UnlockedPowerUpRanks?: Id[];
  BoughtSkins?: Id[];

  KillCount?: Record<Id, number>;
  PickupCount?: Record<Id, number>;
  DestroyedCount?: Record<Id, number>;
  StageCompletionLog?: Record<Id, Id[]>;
  CharacterStageData?: Record<Id, StageRecord[]>;
  CharacterEnemiesKilled?: Record<Id, number>;
  CharacterSurvivedMinutes?: Record<Id, number>;
  EggData?: Record<Id, EggBonuses>;
  UnlockedSkinsV2?: Record<Id, Id[]>;
}

/** A count against the identifiers this build knows about. */
export interface Tally {
  owned: number;
  known: number;
}

/** One row of the character table. */
export interface CharacterProgress {
  id: Id;
  label: string;
  unlocked: boolean;
  bought: boolean;
  survivedMinutes: number;
  enemiesKilled: number;
  stagesCompleted: number;
  stagesPlayed: number;
  hasEgg: boolean;
  eggTotal: number;
  skins: number;
}

/** One row of the stage table. */
export interface StageProgress {
  id: Id;
  label: string;
  unlocked: boolean;
  hyperUnlocked: boolean;
  charactersCompleted: number;
  charactersPlayed: number;
  bestSurvivedMinutes: number;
  totalRuns: number;
}
