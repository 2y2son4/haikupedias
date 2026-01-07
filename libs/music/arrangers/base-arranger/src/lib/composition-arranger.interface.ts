import { Composition, NoteValue } from '@haikupedias/core/types';

/**
 * A scheduled note to be played at a specific time
 */
export interface ScheduledNote {
  note: NoteValue;
  startTime: number;
  duration: number;
}

/**
 * Abstract interface for arranging compositions into playable note sequences
 *
 * Different arrangers interpret the same harmonic composition in different ways:
 * - Gymnopédie arranger: First note solo, then notes 2-4 as chord
 * - Dodecaphonic arranger: All notes sequential
 */
export interface CompositionArranger {
  /**
   * Arrange a composition into a sequence of scheduled notes
   *
   * @param composition - The abstract harmonic composition
   * @param noteDuration - Duration of each note in seconds
   * @returns Array of notes with timing information
   */
  arrange(composition: Composition, noteDuration: number): ScheduledNote[];

  /**
   * Get a human-readable name for this arrangement style
   */
  getName(): string;
}
