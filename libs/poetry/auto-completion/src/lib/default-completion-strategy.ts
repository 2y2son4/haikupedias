import { Word, WordType, TonalityGroup } from '@haikupedias/core/types';
import { PoeticSlot, SlotConstraint, LineRole } from './models/poetic-slot';
import { CompletionStrategy } from './completion-strategy.interface';
import { ConstraintSolver } from './constraint-solver';
import { CandidateScorer, ScoredCandidate, GrammarContext } from './candidate-scorer';
import { WordSelector } from './word-selector';

/**
 * Positional metadata for each of the 8 slots in a 2-4-2 haiku.
 */
interface SlotMeta {
  lineIndex: 0 | 1 | 2;
  linePosition: number;
  role: LineRole;
  preferredType: WordType;
}

/**
 * Aesthetic positional conventions for a 2-4-2 haiku structure.
 *
 * The preferred type and line role guide the scorer but are never
 * enforced as hard constraints, preserving poetic flexibility.
 */
const SLOT_META: readonly SlotMeta[] = [
  // Line 1 (2 words)
  { lineIndex: 0, linePosition: 0, role: 'opener', preferredType: 'adjective' },
  { lineIndex: 0, linePosition: 1, role: 'closer', preferredType: 'noun' },
  // Line 2 (4 words)
  { lineIndex: 1, linePosition: 0, role: 'opener', preferredType: 'adjective' },
  { lineIndex: 1, linePosition: 1, role: 'middle', preferredType: 'noun' },
  { lineIndex: 1, linePosition: 2, role: 'middle', preferredType: 'verb' },
  { lineIndex: 1, linePosition: 3, role: 'closer', preferredType: 'adverb' },
  // Line 3 (2 words)
  { lineIndex: 2, linePosition: 0, role: 'opener', preferredType: 'adjective' },
  { lineIndex: 2, linePosition: 1, role: 'closer', preferredType: 'verb' },
];

/**
 * Standard completion strategy that uses `ConstraintSolver`,
 * `CandidateScorer`, and `WordSelector` to fill empty slots.
 *
 * Slots are processed left-to-right. Words chosen for earlier slots
 * are added to the `no-repeat` exclusion list so each position
 * receives a unique label.
 */
export class DefaultCompletionStrategy implements CompletionStrategy {
  private readonly solver: ConstraintSolver;
  private readonly scorer: CandidateScorer;
  private readonly selector: WordSelector;

  constructor(
    solver = new ConstraintSolver(),
    scorer = new CandidateScorer(),
    selector = new WordSelector(),
  ) {
    this.solver = solver;
    this.scorer = scorer;
    this.selector = selector;
  }

  fill(
    slots: ReadonlyArray<PoeticSlot>,
    wordPool: ReadonlyArray<Word>,
  ): PoeticSlot[] {
    // Build a set of already-used word IDs to feed into no-repeat constraints.
    const usedIds = new Set<string>(
      slots.flatMap((s) => (s.value ? [s.value.id] : [])),
    );

    // Track word type frequencies to encourage diversity
    const typeFrequencies: Record<WordType, number> = {
      noun: 0,
      verb: 0,
      adjective: 0,
      adverb: 0,
    };

    // Count initial word type distribution
    for (const slot of slots) {
      if (slot.value) {
        typeFrequencies[slot.value.type]++;
      }
    }

    const result: PoeticSlot[] = slots.map((slot, slotIndex) => {
      // Never touch user-selected or already-filled slots.
      if (slot.origin === 'user' || slot.value !== undefined) {
        return slot;
      }

      const enrichedSlot = this.injectNoRepeatConstraint(slot, usedIds);
      let candidates = this.solver.resolve(enrichedSlot, wordPool);

      // Build grammar context from adjacent words
      const grammarContext = this.buildGrammarContext(slots, slotIndex);

      const scored = this.scorer.score(candidates, enrichedSlot, grammarContext);
      
      // Apply diversity bonus: underrepresented word types get a score boost
      const diversityBoosted = this.applyDiversityBoost(scored, typeFrequencies);
      
      const word = this.selector.select(diversityBoosted);

      if (word) {
        usedIds.add(word.id);
        typeFrequencies[word.type]++;
      }

      return { ...slot, value: word };
    });

    return result;
  }

  /**
   * Extracts the previous and next words (if any) from adjacent slots
   * to provide grammatical context for candidate scoring.
   */
  private buildGrammarContext(
    slots: ReadonlyArray<PoeticSlot>,
    slotIndex: number,
  ): GrammarContext {
    const context: GrammarContext = {};

    // Look at previous slot
    if (slotIndex > 0) {
      const prevSlot = slots[slotIndex - 1];
      if (prevSlot.value) {
        context.previousWord = prevSlot.value;
      }
    }

    // Look at next slot
    if (slotIndex < slots.length - 1) {
      const nextSlot = slots[slotIndex + 1];
      if (nextSlot.value) {
        context.nextWord = nextSlot.value;
      }
    }

    return context;
  }

  /**
   * Boosts scores for word types that are underrepresented in the haiku.
   * This encourages aesthetic diversity without enforcing hard type constraints.
   */
  private applyDiversityBoost(
    scored: ScoredCandidate[],
    frequencies: Record<WordType, number>,
  ): ScoredCandidate[] {
    const avgFrequency = Object.values(frequencies).reduce((a, b) => a + b, 0) / 4;
    
    const boosted = scored.map((candidate) => {
      const typeCount = frequencies[candidate.word.type];
      const deviation = typeCount - avgFrequency;
      
      // If a type is underrepresented (negative deviation), boost its score.
      // Boost magnitude is moderate (0-1.5 points) to encourage diversity while
      // respecting core aesthetic preferences.
      const boost = Math.max(0, -deviation * 0.5);
      
      return {
        ...candidate,
        score: candidate.score + boost,
      };
    });
    
    // Re-sort by new scores (highest first)
    boosted.sort((a, b) => b.score - a.score);
    return boosted;
  }

  private injectNoRepeatConstraint(
    slot: PoeticSlot,
    usedIds: ReadonlySet<string>,
  ): PoeticSlot {
    const existing = slot.constraints.filter((c) => c.kind !== 'no-repeat');
    const noRepeat: SlotConstraint = {
      kind: 'no-repeat',
      excludedIds: [...usedIds],
    };
    return { ...slot, constraints: [...existing, noRepeat] };
  }
}

/**
 * Builds the default 8-slot template for a blank haiku.
 *
 * All slots start empty (`value: undefined`, `origin: 'generated'`).
 * Aesthetic constraints are derived from `SLOT_META`.
 *
 * @param dominantTonality Optional tonality used as a soft preference
 *   across all generated slots. Pass the tonality of the first
 *   user-selected word to anchor the mood of the poem.
 */
export function buildBlankSlots(
  dominantTonality?: TonalityGroup,
): PoeticSlot[] {
  return SLOT_META.map((meta, index) => {
    const constraints: SlotConstraint[] = [
      { kind: 'word-type', wordType: meta.preferredType },
      { kind: 'position-role', role: meta.role },
    ];

    if (dominantTonality) {
      constraints.push({
        kind: 'tonality-preference',
        group: dominantTonality,
      });
    }

    return {
      id: `slot-${index}`,
      position: index,
      lineIndex: meta.lineIndex,
      linePosition: meta.linePosition,
      value: undefined,
      origin: 'generated',
      editable: true,
      constraints,
    };
  });
}

/**
 * Merges user-selected words into a blank slot template.
 *
 * For each `userWord`, the corresponding slot (matched by position)
 * is frozen with `origin: 'user'` and `editable: true`.
 * Remaining slots stay empty and will be filled by the engine.
 *
 * @param blankSlots   Template produced by `buildBlankSlots`.
 * @param userWords    Map of position → Word for every user selection.
 */
export function mergeUserWords(
  blankSlots: ReadonlyArray<PoeticSlot>,
  userWords: ReadonlyMap<number, Word>,
): PoeticSlot[] {
  return blankSlots.map((slot) => {
    const userWord = userWords.get(slot.position);
    if (!userWord) return slot;

    return {
      ...slot,
      value: userWord,
      origin: 'user',
      editable: true,
      // Remove word-type constraint — user chose freely.
      constraints: slot.constraints.filter((c) => c.kind !== 'word-type'),
    };
  });
}
