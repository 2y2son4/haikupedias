import { NoteValue } from '@haikupedias/core/types';
import {
  MAJOR_THIRD,
  MINOR_THIRD,
  DOMINANT_INTERVAL,
} from '@haikupedias/core/utils';
import { addInterval } from './note-arithmetic';

/**
 * Generates a major third above the given note
 */
export function getMajorThird(note: NoteValue): NoteValue {
  return addInterval(note, MAJOR_THIRD);
}

/**
 * Generates a minor third above the given note
 */
export function getMinorThird(note: NoteValue): NoteValue {
  return addInterval(note, MINOR_THIRD);
}

/**
 * Generates the dominant note (perfect fifth) above the given note
 */
export function getDominant(note: NoteValue): NoteValue {
  return addInterval(note, DOMINANT_INTERVAL);
}

/**
 * Generates a sequence of intervals from a root note
 * @param root The starting note
 * @param intervals Array of interval steps to apply sequentially
 * @returns Array of resulting notes
 */
export function generateSequence(
  root: NoteValue,
  intervals: number[],
): NoteValue[] {
  const sequence: NoteValue[] = [root];
  let current = root;

  for (const interval of intervals) {
    current = addInterval(current, interval);
    sequence.push(current);
  }

  return sequence;
}
