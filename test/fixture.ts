/** A small synthetic save. Real saves hold personal play data and are not committed. */
import type { SaveData } from "../frontend/src/lib/types.ts";

export const SAVE: SaveData = {
  saveName: "Slot 1",
  Platform: "Steam",
  Coins: 1500,
  LifetimeCoins: 90000,
  LifetimeSurvived: 7500,
  Seals: 3,
  HasKilledTheFinalBoss: true,
  BoughtCharacters: ["ANTONIO", "IMELDA"],
  UnlockedCharacters: ["ANTONIO", "IMELDA", "PASQUALINA"],
  OpenedCoffins: ["GIOVANNA"],
  UnlockedWeapons: ["WHIP", "KNIFE", "AXE", "NOT_A_REAL_WEAPON"],
  CollectedItems: ["CLOVER", "SPINACH"],
  Achievements: ["ReachLV5", "ReachLV10"],
  Secrets: ["UnderTheCoffin"],
  UnlockedStages: ["FOREST", "LIBRARY"],
  UnlockedHypers: ["FOREST"],
  UnlockedArcanas: [0, 7],
  BoughtPowerups: ["POWER", "POWER", "ARMOR"],
  KillCount: { BAT1: 120, ZOMBIE: 80 },
  CharacterSurvivedMinutes: { ANTONIO: 90, IMELDA: 45 },
  CharacterEnemiesKilled: { ANTONIO: 5000, IMELDA: 2000 },
  EggData: { ANTONIO: { power: 0.1, total: 12 } },
  UnlockedSkinsV2: { ANTONIO: ["DEFAULT", "LEGACY"] },
  CharacterStageData: {
    ANTONIO: [
      { type: "FOREST", complete: 2, hyper: true, hurry: true, inverse: false, survivedMinutes: 31, startedRun: 4 },
      { type: "LIBRARY", complete: 0, hyper: false, hurry: false, inverse: false, survivedMinutes: 12, startedRun: 2 },
    ],
    IMELDA: [
      { type: "FOREST", complete: 1, hyper: false, hurry: false, inverse: false, survivedMinutes: 30, startedRun: 3 },
    ],
  },
};
