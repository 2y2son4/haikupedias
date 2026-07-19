import { Word } from '@haikupedias/core/types';
import {
  PoeticSlot,
  SlotConstraint,
  WordTypeConstraint,
  NoRepeatConstraint,
} from './models/poetic-slot';

/**
 * Filters a word pool down to candidates that satisfy all hard
 * constraints attached to a slot.
 *
 * Hard constraints — those that must be satisfied for a word to
 * qualify — are:
 *   - `word-type`: the word's grammatical type must match exactly.
 *   - `no-repeat`: the word must not appear in the exclusion list.
 *
 * Soft constraints (`tonality-preference`, `position-role`) are
 * not applied here; they are handled by `CandidateScorer` to rank
 * the remaining candidates rather than eliminate them.
 */
export class ConstraintSolver {
  /**
   * Returns every word from `wordPool` that satisfies all hard
   * constraints on `slot`.
   *
   * If no words survive the filtering, the full word pool is
   * returned so the engine can still produce a result rather than
   * leave a slot empty.
   *
   * @param slot     The slot whose constraints must be satisfied.
   * @param wordPool The full collection of available words.
   */
  resolve(slot: PoeticSlot, wordPool: ReadonlyArray<Word>): Word[] {
    let candidates = [...wordPool];

    for (const constraint of slot.constraints) {
      candidates = this.applyConstraint(candidates, constraint);
    }

    // Fallback: return full pool if constraints left nothing usable.
    return candidates.length > 0 ? candidates : [...wordPool];
  }

  private applyConstraint(
    candidates: Word[],
    constraint: SlotConstraint,
  ): Word[] {
    switch (constraint.kind) {
      case 'word-type':
        return this.filterByWordType(candidates, constraint);

      case 'no-repeat':
        return this.filterByNoRepeat(candidates, constraint);

      // Soft constraints are resolved by the scorer, not here.
      case 'tonality-preference':
      case 'position-role':
        return candidates;
    }
  }

  private filterByWordType(
    candidates: Word[],
    constraint: WordTypeConstraint,
  ): Word[] {
    const filtered = candidates.filter((w) => w.type === constraint.wordType);
    // Preserve candidates if the type filter would remove everything,
    // so the poem can still be completed.
    return filtered.length > 0 ? filtered : candidates;
  }

  private filterByNoRepeat(
    candidates: Word[],
    constraint: NoRepeatConstraint,
  ): Word[] {
    const excluded = new Set(constraint.excludedIds);
    const filtered = candidates.filter((w) => !excluded.has(w.id));
    return filtered.length > 0 ? filtered : candidates;
  }
}
