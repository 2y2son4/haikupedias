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
   * and inserting the 4 missing chromatic notes
   */
  private buildToneRow(compositionNotes: number[]): number[] {
    // Find which chromatic notes (0-11) are missing
    const usedNotes = new Set(compositionNotes.map((n) => n % 12));
    const missingNotes: number[] = [];

    for (let i = 0; i < 12; i++) {
      if (!usedNotes.has(i)) {
        missingNotes.push(i);
      }
    }

    // Sort missing notes for deterministic insertion
    missingNotes.sort((a, b) => a - b);

    // Build the tone row by inserting missing notes strategically
    // Pattern: bar1[step1, step2, MISSING1, step3, step4, MISSING2]
    //          bar2[step1, step2, MISSING3, step3, step4, MISSING4]
    const toneRow: number[] = [];
    let missingIndex = 0;

    for (let barIndex = 0; barIndex < 2; barIndex++) {
      const barStart = barIndex * 4;

      // Notes 1 and 2 from this bar
      toneRow.push(compositionNotes[barStart]);
      toneRow.push(compositionNotes[barStart + 1]);

      // Insert first missing note for this bar
      if (missingIndex < missingNotes.length) {
        toneRow.push(missingNotes[missingIndex++]);
      }

      // Notes 3 and 4 from this bar
      toneRow.push(compositionNotes[barStart + 2]);
      toneRow.push(compositionNotes[barStart + 3]);

      // Insert second missing note for this bar
      if (missingIndex < missingNotes.length) {
        toneRow.push(missingNotes[missingIndex++]);
      }
    }

    return toneRow;
  }
}
