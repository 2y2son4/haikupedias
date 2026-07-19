import { Word } from '@haikupedias/core/types';
import {
  PoeticSlot,
  TonalityPreferenceConstraint,
  PositionRoleConstraint,
  LineRole,
} from './models/poetic-slot';

/**
 * A word together with its computed aesthetic score for a specific slot.
 */
export interface ScoredCandidate {
  readonly word: Word;
  /** Higher scores represent better aesthetic fit. */
  readonly score: number;
}

/**
 * Optional grammatical context for a slot (adjacent words).
 */
export interface GrammarContext {
  previousWord?: Word;
  nextWord?: Word;
}

/**
 * Scoring weights that control how much each dimension contributes
 * to the final score.
 */
interface ScoringWeights {
  readonly tonalityAlignment: number;
  readonly positionRole: number;
  readonly labelLength: number;
  readonly grammarContext: number;
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  tonalityAlignment: 3,
  positionRole: 2,
  labelLength: 1,
  grammarContext: 2.5,  // Strong weight for grammatical coherence
};

/**
 * Ranks candidate words according to aesthetic criteria:
 *
 * 1. **Semantic coherence / tonality alignment** — words whose
 *    tonality group matches the soft preference in the slot's
 *    constraints are favoured.
 * 2. **Imagery and rhythm (position role)** — certain word types
 *    feel more natural at the opening, middle, or closing of a
 *    line (e.g. adjectives open, verbs close).
 * 3. **Musicality** — shorter labels tend to flow more naturally
 *    in poetic reading; this acts as a light tie-breaker.
 *
 * Lexical diversity is enforced upstream by the `no-repeat`
 * constraint, so this scorer does not need to address it.
 */
export class CandidateScorer {
  private readonly weights: ScoringWeights;

  constructor(weights: ScoringWeights = DEFAULT_WEIGHTS) {
    this.weights = weights;
  }

  /**
   * Returns every candidate with its score, sorted descending
   * (highest score first).
   *
   * @param candidates Pre-filtered word list from `ConstraintSolver`.
   * @param slot       The slot being filled (provides soft constraints).
   * @param context    Optional adjacent words for grammatical coherence scoring.
   */
  score(
    candidates: ReadonlyArray<Word>,
    slot: PoeticSlot,
    context?: GrammarContext,
  ): ScoredCandidate[] {
    const tonalityConstraint = this.extractTonalityConstraint(slot);
    const roleConstraint = this.extractRoleConstraint(slot);

    const scored = candidates.map((word) => ({
      word,
      score:
        this.scoreTonality(word, tonalityConstraint) *
          this.weights.tonalityAlignment +
        this.scorePositionRole(word, roleConstraint) *
          this.weights.positionRole +
        this.scoreLabelLength(word) * this.weights.labelLength +
        this.scoreGrammarContext(word, context) *
          this.weights.grammarContext,
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private extractTonalityConstraint(
    slot: PoeticSlot,
  ): TonalityPreferenceConstraint | undefined {
    return slot.constraints.find(
      (c): c is TonalityPreferenceConstraint =>
        c.kind === 'tonality-preference',
    );
  }

  private extractRoleConstraint(
    slot: PoeticSlot,
  ): PositionRoleConstraint | undefined {
    return slot.constraints.find(
      (c): c is PositionRoleConstraint => c.kind === 'position-role',
    );
  }

  private scoreTonality(
    word: Word,
    constraint: TonalityPreferenceConstraint | undefined,
  ): number {
    if (!constraint) return 0;
    return word.tonalityGroup === constraint.group ? 1 : 0;
  }

  /**
   * Awards a score based on how well the word type fits the
   * positional role within the line.
   *
   * Aesthetic conventions used:
   * - opener  → adjective > noun > adverb > verb
   * - middle  → noun > verb > adjective > adverb
   * - closer  → verb > adverb > noun > adjective
   */
  private scorePositionRole(
    word: Word,
    constraint: PositionRoleConstraint | undefined,
  ): number {
    if (!constraint) return 0;
    return this.roleScoreFor(word, constraint.role);
  }

  private roleScoreFor(word: Word, role: LineRole): number {
    const rankings: Record<LineRole, Record<string, number>> = {
      opener: { adjective: 4, noun: 3, adverb: 2, verb: 1 },
      middle: { noun: 4, verb: 3, adjective: 2, adverb: 1 },
      closer: { verb: 4, adverb: 3, noun: 2, adjective: 1 },
    };
    return rankings[role][word.type] ?? 0;
  }

  /** Shorter labels score slightly higher (musicality). */
  private scoreLabelLength(word: Word): number {
    // Normalised: 3-letter word → 1.0, 10-letter word → 0.3
    return Math.max(0, 1 - (word.label.length - 3) / 10);
  }

  /**
   * Scores a candidate based on grammatical fit with adjacent words.
   * Boosts candidates that form natural collocations and penalizes awkward pairs.
   * Range: -1.0 to +1.0
   *
   * Strong penalties for bad pairs (adverb-adverb, noun-noun):
   * - Two adverbs: -1.0 ("softly gently" is unpoetic)
   * - Two adjectives: -0.5 (acceptable but less natural)
   * - Two nouns: -0.3 (rare but sometimes poetic)
   *
   * Strong boosts for good pairs:
   * - Adjective + noun: +1.0 ("bright cloud" is highly natural)
   * - Adverb + verb: +1.0 ("softly float" intensifies action)
   * - Verb + adverb: +0.8 ("float softly" is also strong)
   */
  private scoreGrammarContext(word: Word, context?: GrammarContext): number {
    if (!context) return 0;

    let score = 0;

    // Boost based on previous word type
    if (context.previousWord) {
      const prev = context.previousWord.type;
      const curr = word.type;

      // VERY AWKWARD: Two adverbs ("softly gently", "dimly coldly")
      if (prev === 'adverb' && curr === 'adverb') return -1.0;

      // AWKWARD: Two adjectives (less bad than adverbs)
      if (prev === 'adjective' && curr === 'adjective') score -= 0.5;

      // GOOD: Noun + adjective modifier ("sky clear")
      if (prev === 'noun' && curr === 'adjective') score += 0.6;

      // GOOD: Verb intensified by adverb ("bloom softly")
      if (prev === 'verb' && curr === 'adverb') score += 0.8;

      // OK: Adverb then verb ("softly bloom")
      if (prev === 'adverb' && curr === 'verb') score += 0.4;

      // OK: Adjective then adverb ("soft gently" - modifier chain)
      if (prev === 'adjective' && curr === 'adverb') score += 0.2;

      // RARE: Two nouns (OK in poetry but less common)
      if (prev === 'noun' && curr === 'noun') score -= 0.3;
    }

    // Boost based on next word type
    if (context.nextWord) {
      const curr = word.type;
      const next = context.nextWord.type;

      // EXCELLENT: Adjective before noun ("bright cloud")
      if (curr === 'adjective' && next === 'noun') score += 1.0;

      // EXCELLENT: Adverb before verb ("softly bloom")
      if (curr === 'adverb' && next === 'verb') score += 1.0;

      // GOOD: Verb before noun ("dissolve water")
      if (curr === 'verb' && next === 'noun') score += 0.7;

      // OK: Noun before verb (subject-action)
      if (curr === 'noun' && next === 'verb') score += 0.3;

      // AVOID: Noun before noun ("cloud water" - too ambiguous)
      if (curr === 'noun' && next === 'noun') score -= 0.3;

      // AVOID: Two adverbs back-to-back
      if (curr === 'adverb' && next === 'adverb') score -= 0.8;
    }

    // Clamp to [-1, 1] to prevent extreme scores
    return Math.max(-1.0, Math.min(1.0, score));
  }
}
