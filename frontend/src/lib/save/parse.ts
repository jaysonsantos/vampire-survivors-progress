/** Reads the game save file. The file never leaves the browser. */
import { MAX_SAVE_BYTES } from "../constants.ts";
import type { SaveData } from "../types.ts";

/** Why a file was rejected. The UI maps each reason to a message. */
export type ParseFailure = "too-large" | "not-json" | "not-a-save";

export class SaveParseError extends Error {
  readonly reason: ParseFailure;

  constructor(reason: ParseFailure, message: string) {
    super(message);
    this.name = "SaveParseError";
    this.reason = reason;
  }
}

/** Fields that only a Vampire Survivors save has, used to reject other JSON. */
const REQUIRED_FIELDS = ["Achievements", "UnlockedCharacters", "CharacterStageData"] as const;

/** Parses the text of a save file and checks that it is a save. */
export function parseSave(text: string): SaveData {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new SaveParseError("not-json", "The file is not JSON. Pick the SaveData file that the game writes.");
  }

  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new SaveParseError("not-a-save", "The file is JSON but not a save file.");
  }

  const record = value as Record<string, unknown>;
  const missing = REQUIRED_FIELDS.filter((field) => !(field in record));
  if (missing.length === REQUIRED_FIELDS.length) {
    throw new SaveParseError("not-a-save", "The file has no Vampire Survivors progress fields.");
  }

  return record as SaveData;
}

/** Reads a file that the user dropped or picked. */
export async function readSaveFile(file: File): Promise<SaveData> {
  if (file.size > MAX_SAVE_BYTES) {
    throw new SaveParseError("too-large", "The file is larger than a save file can be.");
  }
  return parseSave(await file.text());
}
