import { NoteValue } from '@haikupedias/core/types';
import { CHROMATIC_SCALE } from '@haikupedias/core/utils';

/**
 * Adds an interval to a note value within the chromatic scale
 * Handles wrapping around the 12-note chromatic scale
 */
export function addInterval(note: NoteValue, interval: number): NoteValue {
  return ((note + interval) % CHROMATIC_SCALE) as NoteValue;
}

/**
 * Subtracts an interval from a note value within the chromatic scale
 * Handles wrapping around the 12-note chromatic scale
 */
export function subtractInterval(note: NoteValue, interval: number): NoteValue {
  const result = (note - interval) % CHROMATIC_SCALE;
  return (result < 0 ? result + CHROMATIC_SCALE : result) as NoteValue;
}

/**
 * Calculates the distance (in semitones) between two notes
 * Always returns the shortest distance (0-6 semitones)
 */
export function getIntervalDistance(
  note1: NoteValue,
  note2: NoteValue,
): number {
  const diff = Math.abs(note1 - note2);
  return diff > CHROMATIC_SCALE / 2 ? CHROMATIC_SCALE - diff : diff;
}

/**
 * Transposes a note by the given number of semitones
 * Positive values transpose up, negative values transpose down
 */
export function transpose(note: NoteValue, semitones: number): NoteValue {
  return addInterval(note, semitones);
}

/**
 * Checks if a note value is valid (0-11)
 */
export function isValidNote(value: number): value is NoteValue {
  return Number.isInteger(value) && value >= 0 && value < CHROMATIC_SCALE;
}
