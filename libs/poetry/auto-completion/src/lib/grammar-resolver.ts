import { PoeticSlot } from './models/poetic-slot';

/**
 * Result returned by `GrammarResolver.resolve`.
 */
export interface GrammarResolutionResult {
  /**
   * IDs of generated slots that must be re-solved because they depend
   * grammatically on the slot that changed.
   *
   * User-origin slots are never included here because they are frozen.
   */
  readonly affectedSlotIds: ReadonlyArray<string>;
}

/**
 * Determines which generated slots need to be re-solved when a
 * specific slot changes value.
 *
 * The Haikupedias vocabulary does not use inflected forms (every word
 * is a base form), so there is no morphological agreement to enforce.
 * However, **tonality coherence** across adjacent positions within the
 * same line is treated as a soft grammatical rule: when a user changes
 * a word, neighbouring generated words whose tonality no longer aligns
 * with the dominant tonality of the line are flagged for regeneration.
 *
 * This keeps the poem feeling internally consistent without touching
 * user-selected words.
 */
export class GrammarResolver {
  /**
   * Returns the set of generated slot IDs that should be re-solved
   * after `changedSlot` receives a new value.
   *
   * @param changedSlot The slot that just changed.
   * @param allSlots    Current state of every slot in the poem.
   */
  resolve(
    changedSlot: PoeticSlot,
    allSlots: ReadonlyArray<PoeticSlot>,
  ): GrammarResolutionResult {
    const affectedSlotIds: string[] = [];

    if (!changedSlot.value) {
      return { affectedSlotIds };
    }

    const newTonality = changedSlot.value.tonalityGroup;
    const lineSlots = allSlots.filter(
      (s) => s.lineIndex === changedSlot.lineIndex,
    );

    for (const slot of lineSlots) {
      if (slot.id === changedSlot.id) continue;
      if (slot.origin !== 'generated') continue;
      if (!slot.value) continue;

      // Flag the slot if its tonality conflicts with the new word's tonality.
      if (slot.value.tonalityGroup !== newTonality) {
        affectedSlotIds.push(slot.id);
      }
    }

    return { affectedSlotIds };
  }
}
