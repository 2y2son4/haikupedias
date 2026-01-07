import { Composition } from '@haikupedias/core/types';
import {
  CompositionArranger,
  ScheduledNote,
} from '@haikupedias/music/arrangers/base-arranger';

/**
 * Gymnopédie-inspired arranger
 *
 * Arrangement style:
 * - Bar 1: First note alone (1 unit), then notes 2-4 as simultaneous chord (2 units)
 * - Bar 2: First note alone (1 unit), then notes 6-8 as simultaneous chord (2 units)
 *
 * This creates the sparse, contemplative texture characteristic of Satie's Gymnopédies.
 */
export class GymnopedieArranger implements CompositionArranger {
  getName(): string {
    return 'Gymnopédie (Chords)';
  }

  arrange(composition: Composition, noteDuration: number): ScheduledNote[] {
    const scheduledNotes: ScheduledNote[] = [];
    let currentTime = 0;
    const chordDuration = noteDuration * 2; // Chord is twice as long

    // Play the composition twice (4 bars total)
    for (let repeat = 0; repeat < 2; repeat++) {
      for (const bar of composition.bars) {
        const steps = bar.steps;

        // Play first note alone (tonic) - 1 time unit
        scheduledNotes.push({
          note: steps[0].root,
          startTime: currentTime,
          duration: noteDuration,
        });
        currentTime += noteDuration;

        // Play notes 2, 3, 4 as a chord (simultaneously) - 2 time units
        if (steps.length >= 4) {
          const chordTime = currentTime;
          scheduledNotes.push({
            note: steps[1].root,
            startTime: chordTime,
            duration: chordDuration,
          });
          scheduledNotes.push({
            note: steps[2].root,
            startTime: chordTime,
            duration: chordDuration,
          });
          scheduledNotes.push({
            note: steps[3].root,
            startTime: chordTime,
            duration: chordDuration,
          });
          currentTime += chordDuration;
        }
      }
    }

    return scheduledNotes;
  }
}
