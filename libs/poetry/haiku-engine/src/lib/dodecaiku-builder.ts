import { Haiku, HaikuLine, Word } from '@haikupedias/core/types';
import {
  DODECAIKU_LINE_LENGTHS,
  DODECAIKU_WORDS_TOTAL,
} from '@haikupedias/core/utils';

export interface DodecaikuBuildResult {
  success: boolean;
  haiku?: Haiku;
  errors?: string[];
}

/**
 * Builds a dodecaiku (12-word haiku) with a 5-7-5 syllable-like structure, but using word counts.
 * The dodecaiku uses all 12 words for composition.
 */
export class DodecaikuBuilder {
  static buildFromArray(words: Word[]): DodecaikuBuildResult {
    if (words.length !== DODECAIKU_WORDS_TOTAL) {
      return {
        success: false,
        errors: [
          `Expected ${DODECAIKU_WORDS_TOTAL} words but got ${words.length}.`,
        ],
      };
    }

    const uniqueIds = new Set(words.map((word) => word.id));
    if (uniqueIds.size !== words.length) {
      return {
        success: false,
        errors: ['All words must be unique. Duplicate words are not allowed.'],
      };
    }

    // Build the 3-6-3 structure
    const line1: HaikuLine = {
      position: 1,
      words: words.slice(0, DODECAIKU_LINE_LENGTHS[0]),
    };

    const line2: HaikuLine = {
      position: 2,
      words: words.slice(
        DODECAIKU_LINE_LENGTHS[0],
        DODECAIKU_LINE_LENGTHS[0] + DODECAIKU_LINE_LENGTHS[1],
      ),
    };

    const line3: HaikuLine = {
      position: 3,
      words: words.slice(
        DODECAIKU_LINE_LENGTHS[0] + DODECAIKU_LINE_LENGTHS[1],
        DODECAIKU_WORDS_TOTAL,
      ),
    };

    return {
      success: true,
      haiku: {
        lines: [line1, line2, line3],
      },
    };
  }
}
