import { NoteValue } from "@haikupedias/core/types";
import { CHROMATIC_SCALE } from "./constants";

/**
 * Add an interval to a note, wrapping around the chromatic scale
 * @param note - Base note (0-11)
 * @param interval - Interval in semitones
 * @returns Resulting note (0-11)
 */
export function addInterval(note: NoteValue, interval: number): NoteValue {
  return ((note + interval) % CHROMATIC_SCALE) as NoteValue;
}

/**
 * Generate a random note value
 * @returns Random note (0-11)
 */
export function randomNote(): NoteValue {
  return Math.floor(Math.random() * CHROMATIC_SCALE) as NoteValue;
}

/**
 * Note names for debugging/display
 */
export const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

/**
 * Convert note value to name
 * @param note - Note value (0-11)
 * @returns Note name (e.g., "C", "F#")
 */
export function noteToName(note: NoteValue): string {
  return NOTE_NAMES[note];
}
