import { Haiku, HaikuLine, Word } from '@haikupedias/core/types';
import { validateHaiku } from './haiku-validator';

/**
 * Builder result that includes either a valid haiku or validation errors
 */
export interface HaikuBuildResult {
  success: boolean;
  haiku?: Haiku;
  errors?: string[];
}

/**
 * Service for building haiku structures from selected words
 */
export class HaikuBuilder {
  /**
   * Builds a complete Haiku object from word arrays
   * Validates structure before building
   */
  static build(
    line1Words: Word[],
    line2Words: Word[],
    line3Words: Word[],
  ): HaikuBuildResult {
    // Validate the structure
    const validation = validateHaiku(line1Words, line2Words, line3Words);

    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    // Build the haiku lines
    const line1: HaikuLine = {
      position: 1,
      words: line1Words,
    };

    const line2: HaikuLine = {
      position: 2,
      words: line2Words,
    };

    const line3: HaikuLine = {
      position: 3,
      words: line3Words,
    };

    // Build the complete haiku
    const haiku: Haiku = {
      lines: [line1, line2, line3],
    };

    return {
      success: true,
      haiku,
    };
  }

  /**
   * Builds a haiku from a flat array of 8 words
   * Automatically distributes words in 2-4-2 pattern
   */
  static buildFromArray(words: Word[]): HaikuBuildResult {
    if (words.length !== 8) {
      return {
        success: false,
        errors: [
          `Expected 8 words but got ${words.length}. Cannot auto-distribute.`,
        ],
      };
    }

    // Distribute: first 2, next 4, last 2
    const line1Words = words.slice(0, 2);
    const line2Words = words.slice(2, 6);
    const line3Words = words.slice(6, 8);

    return this.build(line1Words, line2Words, line3Words);
  }
}
