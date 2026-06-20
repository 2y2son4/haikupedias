import {
  Bar,
  Composition,
  HarmonicStep,
  Haiku,
  NoteValue,
  Word,
} from '@haikupedias/core/types';
import { MAJOR_THIRD, MINOR_THIRD, randomNote } from '@haikupedias/core/utils';
import { addInterval, getDominant } from '@haikupedias/music/theory';

const DODECA_BAR_LENGTH = 4;
const DODECA_BARS_TOTAL = 3;

export class DodecaikuCompositionGenerator {
  static generate(haiku: Haiku): Composition {
    const allWords: Word[] = [
      ...haiku.lines[0].words,
      ...haiku.lines[1].words,
      ...haiku.lines[2].words,
    ];

    const bar1Tonic = randomNote();
    const bar2Tonic = getDominant(bar1Tonic);
    const bar3Tonic = getDominant(bar2Tonic);

    const bars: Bar[] = [
      this.generateBar(bar1Tonic, allWords.slice(0, DODECA_BAR_LENGTH)),
      this.generateBar(
        bar2Tonic,
        allWords.slice(DODECA_BAR_LENGTH, DODECA_BAR_LENGTH * 2),
      ),
      this.generateBar(
        bar3Tonic,
        allWords.slice(DODECA_BAR_LENGTH * 2, DODECA_BAR_LENGTH * 3),
      ),
    ];

    return {
      bars: bars.slice(0, DODECA_BARS_TOTAL),
    };
  }

  private static generateBar(tonic: number, words: Word[]): Bar {
    const steps: HarmonicStep[] = [];
    let currentNote = tonic;

    for (const word of words) {
      const interval =
        word.tonalityGroup === 'major' ? MAJOR_THIRD : MINOR_THIRD;
      const nextNote = addInterval(currentNote as NoteValue, interval);

      steps.push({
        root: currentNote as NoteValue,
        interval,
        result: nextNote,
      });

      currentNote = nextNote;
    }

    return {
      tonic: tonic as NoteValue,
      steps,
    };
  }
}
