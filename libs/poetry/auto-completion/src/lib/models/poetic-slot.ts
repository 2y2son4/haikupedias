import { Word, WordType, TonalityGroup } from '@haikupedias/core/types';

/**
 * Identifies who provided the value for a poetic slot.
 * 'user' — the user explicitly selected this word.
 * 'generated' — the engine filled this slot automatically.
 */
export type SlotOrigin = 'user' | 'generated';

/**
 * Discriminated union of all constraint types that may be applied to a slot.
 */
export type SlotConstraint =
  | WordTypeConstraint
  | TonalityPreferenceConstraint
  | NoRepeatConstraint
  | PositionRoleConstraint;

/**
 * Restricts the slot to words of a specific grammatical type.
 */
export interface WordTypeConstraint {
  readonly kind: 'word-type';
  /** Required word type for this slot. */
  readonly wordType: WordType;
}

/**
 * Expresses a soft preference for a tonality group.
 * The solver should favour this group but may use any word when
 * no matching candidates exist.
 */
export interface TonalityPreferenceConstraint {
  readonly kind: 'tonality-preference';
  readonly group: TonalityGroup;
}

/**
 * Lists word IDs that must not be chosen for this slot.
 * Used to avoid repeating words already present in the poem.
 */
export interface NoRepeatConstraint {
  readonly kind: 'no-repeat';
  readonly excludedIds: ReadonlyArray<string>;
}

/**
 * Soft positional role expressing the aesthetic expectation for
 * where this slot appears within its line (opener / middle / closer).
 */
export type LineRole = 'opener' | 'middle' | 'closer';

export interface PositionRoleConstraint {
  readonly kind: 'position-role';
  readonly role: LineRole;
}

/**
 * A single constrained word position within the haiku structure.
 *
 * Slots are the unit of work for the auto-completion engine:
 * each slot either carries a user-selected word (frozen) or a
 * generated word (replaceable without affecting user choices).
 */
export interface PoeticSlot {
  /** Unique identifier for this slot (e.g. "slot-0", "slot-3"). */
  readonly id: string;

  /**
   * Zero-based global position across all 8 slots (0–7).
   * Slots 0–1 belong to line 1, 2–5 to line 2, 6–7 to line 3.
   */
  readonly position: number;

  /** Zero-based line index (0 = line 1, 1 = line 2, 2 = line 3). */
  readonly lineIndex: 0 | 1 | 2;

  /** Zero-based position of this slot within its line. */
  readonly linePosition: number;

  /** The word currently occupying this slot, or undefined if unfilled. */
  readonly value: Word | undefined;

  /** Identifies whether this word was chosen by the user or the engine. */
  readonly origin: SlotOrigin;

  /**
   * Whether the user may interact with this slot to change its word.
   * User-origin slots are always editable; generated slots are editable
   * through the individual regeneration action.
   */
  readonly editable: boolean;

  /** Ordered list of constraints the engine must satisfy when filling this slot. */
  readonly constraints: ReadonlyArray<SlotConstraint>;
}
