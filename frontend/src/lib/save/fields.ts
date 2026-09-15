/** The save fields that the app reads, as a runtime list. `tools/make-sample-save.ts` keeps only these. */
import type { SaveData } from "../types.ts";

export const SAVE_FIELDS = [
  "saveName",
  "saveIcon",
  "Platform",
  "Coins",
  "LifetimeCoins",
  "TotalCoins",
  "LifetimeSurvived",
  "LifetimeHeal",
  "Seals",
  "HasKilledTheFinalBoss",
  "BoughtCharacters",
  "UnlockedCharacters",
  "OpenedCoffins",
  "CollectedWeapons",
  "UnlockedWeapons",
  "CollectedItems",
  "Achievements",
  "Secrets",
  "UnlockedStages",
  "UnlockedHypers",
  "UnlockedArcanas",
  "BoughtPowerups",
  "UnlockedPowerUpRanks",
  "BoughtSkins",
  "KillCount",
  "PickupCount",
  "DestroyedCount",
  "StageCompletionLog",
  "CharacterStageData",
  "CharacterEnemiesKilled",
  "CharacterSurvivedMinutes",
  "EggData",
  "UnlockedSkinsV2",
] as const satisfies readonly (keyof SaveData)[];

/** The name the sample save shows in place of the player's own save name. */
export const SAMPLE_SAVE_NAME = "Sample save";
