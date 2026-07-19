import { Word, TonalityGroup } from '@haikupedias/core/types';
import { PoeticSlot } from './models/poetic-slot';
import { CompletionStrategy } from './completion-strategy.interface';
import {
  DefaultCompletionStrategy,
  buildBlankSlots,
  mergeUserWords,
} from './default-completion-strategy';
import { GrammarResolver } from './grammar-resolver';
import { ConstraintSolver } from './constraint-solver';
import { CandidateScorer } from './candidate-scorer';
import { WordSelector } from './word-selector';

/**
 * Options for `AutoCompletionEngine.regenerateSlot`.
 */
export interface RegenerateOptions {
  /**
   * Offset into the candidate ranking to allow cycling through
   * alternatives without randomness.
   * 0 = best candidate, 1 = second-best, etc.
   */
  readonly offset?: number;
}

/**
 * Result returned by `AutoCompletionEngine.complete`.
 */
export interface CompletionResult {
  /** Fully populated 8-slot array for the poem. */
  readonly slots: ReadonlyArray<PoeticSlot>;
  /** Words extracted from slots in order, ready for `HaikuBuilder`. */
  readonly words: ReadonlyArray<Word>;
}

/**
 * Central orchestrator for the automatic poetic completion system.
 *
 * ### Responsibilities
 *
 * - Build the initial slot template for a new poem.
 * - Freeze user-selected words so they are never modified.
 * - Fill every empty slot using the configured `CompletionStrategy`.
 * - Expose individual slot regeneration that respects user-locked words.
 * - Delegate grammar side-effects to `GrammarResolver`.
 *
 * ### Non-responsibilities
 *
 * - Validation of the produced haiku (delegated to `HaikuEngine`).
 * - UI concerns of any kind.
 * - AI or LLM inference.
 *
 * ### Usage
 *
 * ```ts
 * const engine = new AutoCompletionEngine(wordPool);
 *
 * // User selects "shadow" for position 0
 * const result = engine.complete(new Map([[0, shadowWord]]));
 * // → result.slots contains 8 filled PoeticSlots
 * // → result.words  contains 8 Words in order
 *
 * // User wants a different word at position 3
 * const updated = engine.regenerateSlot('slot-3', result.slots);
 * ```
 */
export class AutoCompletionEngine {
  private readonly wordPool: ReadonlyArray<Word>;
  private readonly strategy: CompletionStrategy;
  private readonly grammarResolver: GrammarResolver;
  private readonly solver: ConstraintSolver;
  private readonly scorer: CandidateScorer;
  private readonly selector: WordSelector;

  constructor(
    wordPool: ReadonlyArray<Word>,
    strategy?: CompletionStrategy,
    grammarResolver = new GrammarResolver(),
    solver = new ConstraintSolver(),
    scorer = new CandidateScorer(),
    selector = new WordSelector(),
  ) {
    this.wordPool = wordPool;
    this.solver = solver;
    this.scorer = scorer;
    this.selector = selector;
    this.grammarResolver = grammarResolver;
    this.strategy =
      strategy ?? new DefaultCompletionStrategy(solver, scorer, selector);
  }

  /**
   * Produces a complete 8-slot poem given the user's current word
   * selections.
   *
   * Only slots corresponding to positions in `userWords` are frozen.
   * All other slots are filled automatically.
   *
   * @param userWords Map of global position (0–7) → user-selected Word.
   */
  complete(userWords: ReadonlyMap<number, Word>): CompletionResult {
    const dominantTonality = this.inferDominantTonality(userWords);
    const blank = buildBlankSlots(dominantTonality);
    const merged = mergeUserWords(blank, userWords);
    const filled = this.strategy.fill(merged, this.wordPool);
    return this.buildResult(filled);
  }

  /**
   * Regenerates a single generated slot without affecting any other slot.
   *
   * If the new word causes tonality inconsistencies in neighbouring
   * generated slots on the same line, those slots are also re-solved
   * (never user-selected slots).
   *
   * @param slotId      ID of the slot to regenerate (e.g. "slot-3").
   * @param currentSlots Current full state of all slots.
   * @param options     Optional offset to cycle through candidates.
   */
  regenerateSlot(
    slotId: string,
    currentSlots: ReadonlyArray<PoeticSlot>,
    options: RegenerateOptions = {},
  ): CompletionResult {
    const target = currentSlots.find((s) => s.id === slotId);
    if (!target || target.origin === 'user') {
      // Never regenerate user words; return current state unchanged.
      return this.buildResult([...currentSlots]);
    }

    // Collect IDs of words used by other slots to avoid repetition.
    const usedIds = new Set<string>(
      currentSlots
        .filter((s) => s.id !== slotId && s.value)
        .map((s) => s.value!.id),
    );

    const enriched = this.injectNoRepeat(target, usedIds);
    const candidates = this.solver.resolve(enriched, this.wordPool);
    const scored = this.scorer.score(candidates, enriched);
    const word = this.selector.select(scored, options.offset ?? 0);

    const regenerated = { ...target, value: word };

    // Build working slot array with the newly chosen word.
    let updatedSlots: PoeticSlot[] = currentSlots.map((s) =>
      s.id === slotId ? regenerated : s,
    );

    // Re-solve generated neighbours that no longer cohere tonally.
    const { affectedSlotIds } = this.grammarResolver.resolve(
      regenerated,
      updatedSlots,
    );

    for (const affectedId of affectedSlotIds) {
      updatedSlots = this.regenerateAffected(affectedId, updatedSlots);
    }

    return this.buildResult(updatedSlots);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private inferDominantTonality(
    userWords: ReadonlyMap<number, Word>,
  ): TonalityGroup | undefined {
    if (userWords.size === 0) return undefined;

    let major = 0;
    let minor = 0;

    for (const word of userWords.values()) {
      if (word.tonalityGroup === 'major') major++;
      else minor++;
    }

    return major >= minor ? 'major' : 'minor';
  }

  private injectNoRepeat(
    slot: PoeticSlot,
    usedIds: ReadonlySet<string>,
  ): PoeticSlot {
    const constraints = [
      ...slot.constraints.filter((c) => c.kind !== 'no-repeat'),
      { kind: 'no-repeat' as const, excludedIds: [...usedIds] },
    ];
    return { ...slot, constraints };
  }

  private regenerateAffected(
    slotId: string,
    slots: PoeticSlot[],
  ): PoeticSlot[] {
    const target = slots.find((s) => s.id === slotId);
    if (!target || target.origin === 'user') return slots;

    const usedIds = new Set<string>(
      slots.filter((s) => s.id !== slotId && s.value).map((s) => s.value!.id),
    );

    const enriched = this.injectNoRepeat(target, usedIds);
    const candidates = this.solver.resolve(enriched, this.wordPool);
    const scored = this.scorer.score(candidates, enriched);
    const word = this.selector.select(scored);

    return slots.map((s) => (s.id === slotId ? { ...s, value: word } : s));
  }

  private buildResult(slots: PoeticSlot[]): CompletionResult {
    const sorted = [...slots].sort((a, b) => a.position - b.position);
    const words = sorted
      .map((s) => s.value)
      .filter((w): w is Word => w !== undefined);

    return { slots: sorted, words };
  }
}
