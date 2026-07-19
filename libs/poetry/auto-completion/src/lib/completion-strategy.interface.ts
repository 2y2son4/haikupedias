import { Word } from '@haikupedias/core/types';
import { PoeticSlot } from './models/poetic-slot';

/**
 * Strategy contract for filling empty poetic slots.
 *
 * Implementations choose how candidates are selected given the
 * current slot context and available word pool. The engine
 * delegates the actual filling decision to a strategy, keeping
 * the two concerns independent.
 */
export interface CompletionStrategy {
  /**
   * Fills all empty slots in the provided array and returns a new
   * array with every slot populated.
   *
   * Slots whose `origin` is 'user' must never be modified.
   * Only slots whose `value` is `undefined` should be resolved.
   *
   * @param slots   Current state of all 8 poetic slots.
   * @param wordPool All words available for selection.
   * @returns A new array of slots with previously empty slots filled.
   */
  fill(
    slots: ReadonlyArray<PoeticSlot>,
    wordPool: ReadonlyArray<Word>,
  ): PoeticSlot[];
}
