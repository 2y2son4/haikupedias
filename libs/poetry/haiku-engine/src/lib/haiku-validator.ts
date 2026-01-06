import { Word } from '@haikupedias/core/types';
import { HAIKU_LINE_LENGTHS, WORDS_TOTAL } from '@haikupedias/core/utils';

/**
 * Validation result for haiku structure
 */
export interface HaikuValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates if the total number of selected words matches the required count
 */
export function validateTotalWords(words: Word[]): HaikuValidationResult {
  const errors: string[] = [];

  if (words.length !== WORDS_TOTAL) {
    errors.push(
      `Expected ${WORDS_TOTAL} words but got ${words.length}. Haiku structure requires 2-4-2 words.`,
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates if word distribution matches haiku structure (2-4-2)
 */
export function validateLineDistribution(
  line1Words: Word[],
  line2Words: Word[],
  line3Words: Word[],
): HaikuValidationResult {
  const errors: string[] = [];

  if (line1Words.length !== HAIKU_LINE_LENGTHS[0]) {
    errors.push(
      `Line 1 must have ${HAIKU_LINE_LENGTHS[0]} words but has ${line1Words.length}`,
    );
  }

  if (line2Words.length !== HAIKU_LINE_LENGTHS[1]) {
    errors.push(
      `Line 2 must have ${HAIKU_LINE_LENGTHS[1]} words but has ${line2Words.length}`,
    );
  }

  if (line3Words.length !== HAIKU_LINE_LENGTHS[2]) {
    errors.push(
      `Line 3 must have ${HAIKU_LINE_LENGTHS[2]} words but has ${line3Words.length}`,
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates that all words are unique (no duplicates)
 */
export function validateUniqueWords(words: Word[]): HaikuValidationResult {
  const errors: string[] = [];
  const wordIds = words.map((w) => w.id);
  const uniqueIds = new Set(wordIds);

  if (wordIds.length !== uniqueIds.size) {
    errors.push('All words must be unique. Duplicate words are not allowed.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates complete haiku structure
 */
export function validateHaiku(
  line1Words: Word[],
  line2Words: Word[],
  line3Words: Word[],
): HaikuValidationResult {
  const allWords = [...line1Words, ...line2Words, ...line3Words];
  const errors: string[] = [];

  // Validate total count
  const totalValidation = validateTotalWords(allWords);
  errors.push(...totalValidation.errors);

  // Validate line distribution
  const distributionValidation = validateLineDistribution(
    line1Words,
    line2Words,
    line3Words,
  );
  errors.push(...distributionValidation.errors);

  // Validate uniqueness
  const uniqueValidation = validateUniqueWords(allWords);
  errors.push(...uniqueValidation.errors);

  return {
    valid: errors.length === 0,
    errors,
  };
}
