import {
  Haiku,
  Word,
  Composition,
  Bar,
  HarmonicStep,
  NoteValue,
} from '@haikupedias/core/types';
import { randomNote } from '@haikupedias/core/utils';
import {
  BAR_LENGTH,
  BARS_TOTAL,
  MAJOR_THIRD,
  MINOR_THIRD,
} from '@haikupedias/core/utils';
import { addInterval, getDominant } from '@haikupedias/music/theory';

/**
 * Generates a composition from a haiku following the Gymnopédie-inspired algorithm
 */
export class CompositionGenerator {
  /**
   * Generates a complete composition from a haiku
   *
   * Algorithm:
   * - Bar 1: Random tonic, 4 harmonic steps using major/minor thirds from word tonalities
   * - Bar 2: Dominant of Bar 1 tonic, 4 harmonic steps
   */
  static generate(haiku: Haiku): Composition {
    // Collect all 8 words from the haiku
    const allWords: Word[] = [
      ...haiku.lines[0].words,
      ...haiku.lines[1].words,
      ...haiku.lines[2].words,
    ];

    // Generate Bar 1 with random tonic
    const bar1Tonic = randomNote();
    const bar1 = this.generateBar(bar1Tonic, allWords.slice(0, BAR_LENGTH));

    // Generate Bar 2 with dominant of Bar 1 tonic
    const bar2Tonic = getDominant(bar1Tonic);
    const bar2 = this.generateBar(bar2Tonic, allWords.slice(BAR_LENGTH));

    return {
      bars: [bar1, bar2],
    };
  }

  /**
   * Generates a single bar with harmonic steps based on word tonalities
   */
  private static generateBar(tonic: number, words: Word[]): Bar {
    const steps: HarmonicStep[] = [];
    let currentNote = tonic;

    for (const word of words) {
      // Determine interval based on word tonality
      const interval =
        word.tonalityGroup === 'major' ? MAJOR_THIRD : MINOR_THIRD;

      // Calculate next note
      const nextNote = addInterval(currentNote as NoteValue, interval);

      // Create harmonic step
      steps.push({
        root: currentNote as NoteValue,
        interval,
        result: nextNote,
      });

      // Move to next note for next iteration
      currentNote = nextNote;
    }

    return {
      tonic: tonic as NoteValue,
      steps,
    };
  }
}
