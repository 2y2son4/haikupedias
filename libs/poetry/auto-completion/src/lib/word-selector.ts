import { Word } from '@haikupedias/core/types';
import { ScoredCandidate } from './candidate-scorer';

/**
 * Selects a single word from a ranked list of scored candidates.
 *
 * Selection is deterministic by default: the candidate with the
 * highest score is always chosen so that the same poem inputs
 * always produce the same generated words.
 *
 * An optional `offset` parameter allows the individual regeneration
 * action to cycle through the ranked list: offset 0 picks the best
 * candidate, offset 1 picks the second-best, and so on. This
 * provides the "regenerate" experience without introducing randomness.
 *
 * When the offset exceeds the available candidates it wraps around,
 * so the user never reaches a dead end.
 */
export class WordSelector {
  /**
   * Returns the word at `offset` position in the ranked `candidates`
   * list.  Defaults to the top-ranked candidate when `offset` is 0.
   *
   * @param candidates Scored and sorted list (highest score first).
   * @param offset     Optional position in the ranking to pick from.
   */
  select(
    candidates: ReadonlyArray<ScoredCandidate>,
    offset = 0,
  ): Word | undefined {
    if (candidates.length === 0) return undefined;

    const index = offset % candidates.length;
    return candidates[index]?.word;
  }
}
