/**
 * Word types for poetry composition
 */
export type WordType = "noun" | "verb" | "adjective" | "adverb";

/**
 * Tonality groups for musical mapping
 */
export type TonalityGroup = "major" | "minor";

/**
 * A word unit in the poetic vocabulary
 */
export interface Word {
  id: string;
  label: string;
  type: WordType;
  tonalityGroup: TonalityGroup;
}

/**
 * A single line in the haiku structure
 */
export interface HaikuLine {
  position: 1 | 2 | 3;
  words: Word[];
}

/**
 * Complete haiku structure
 */
export interface Haiku {
  lines: [HaikuLine, HaikuLine, HaikuLine];
}
