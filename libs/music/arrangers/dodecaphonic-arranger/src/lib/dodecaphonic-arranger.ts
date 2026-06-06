import { Composition, NoteValue } from '@haikupedias/core/types';
import {
  CompositionArranger,
  ScheduledNote,
} from '@haikupedias/music/arrangers/base-arranger';

/**
 * Dodecaphonic (twelve-tone) arranger
 *
 * Implements authentic twelve-tone technique by:
 * 1. Extracting the 8 haiku-derived notes from the composition
 * 2. Finding the 4 missing chromatic notes (0-11)
 * 3. Inserting them strategically to create a complete 12-note tone row
 * 4. Playing all 12 notes sequentially without repetition
 *
 * This follows Schoenberg's twelve-tone technique where all 12 chromatic
 * notes are played exactly once before any note repeats.
 */
export class DodecaphonicArranger implements CompositionArranger {
  getName(): string {
    return 'Dodecaphonic (12-Tone)';
  }

  arrange(composition: Composition, noteDuration: number): ScheduledNote[] {
    // Extract the 8 notes from the composition
    const compositionNotes: number[] = [];
    for (const bar of composition.bars) {
      for (const step of bar.steps) {
        compositionNotes.push(step.root);
      }
    }

    // Build the 12-tone row
    const toneRow = this.buildToneRow(compositionNotes);

    // Schedule all 12 notes sequentially
    const scheduledNotes: ScheduledNote[] = [];
    let currentTime = 0;

    for (const note of toneRow) {
      scheduledNotes.push({
        note: (note % 12) as NoteValue,
        startTime: currentTime,
        duration: noteDuration,
      });
      currentTime += noteDuration;
    }

    return scheduledNotes;
  }

  /**
   * Builds a 12-tone row from the 8 composition notes by finding
   * and inserting the missing chromatic notes
   */
  private buildToneRow(compositionNotes: number[]): number[] {
    // Keep only the first occurrence of each pitch class so the row cannot repeat.
    const toneRow: number[] = [];
    const usedNotes = new Set<number>();

    for (const note of compositionNotes) {
      const pitchClass = note % 12;
      if (!usedNotes.has(pitchClass)) {
        usedNotes.add(pitchClass);
        toneRow.push(pitchClass);
      }
    }

    // Find which chromatic notes (0-11) are missing.
    const missingNotes: number[] = [];

    for (let i = 0; i < 12; i++) {
      if (!usedNotes.has(i)) {
        missingNotes.push(i);
      }
    }

    // Sort missing notes for deterministic completion of the row.
    missingNotes.sort((a, b) => a - b);

    // Append the missing notes to complete the 12-tone row.
    for (const note of missingNotes) {
      toneRow.push(note);
    }

    return toneRow;
  }
}
