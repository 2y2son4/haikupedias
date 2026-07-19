/**
 * @haikupedias/poetry/auto-completion
 *
 * Automatic poetic completion engine for Haikupedias.
 *
 * Public API surface:
 *
 * **Models**
 * - `PoeticSlot`          — a constrained word position in the poem
 * - `SlotOrigin`          — 'user' | 'generated'
 * - `SlotConstraint`      — discriminated union of all constraint types
 *
 * **Engine**
 * - `AutoCompletionEngine` — main orchestrator; use this in consuming code
 * - `CompletionResult`     — return type of `complete` and `regenerateSlot`
 * - `RegenerateOptions`    — options for `regenerateSlot`
 *
 * **Strategy**
 * - `CompletionStrategy`         — interface for custom strategies
 * - `DefaultCompletionStrategy`  — built-in implementation
 *
 * **Utilities**
 * - `buildBlankSlots`  — creates the initial 8-slot template
 * - `mergeUserWords`   — overlays user selections onto a blank template
 *
 * **Supporting classes** (exported for testing and extension)
 * - `ConstraintSolver`
 * - `CandidateScorer`
 * - `GrammarResolver`
 * - `WordSelector`
 * - `ScoredCandidate`
 * - `GrammarResolutionResult`
 */

export * from './lib/models/poetic-slot';
export * from './lib/completion-strategy.interface';
export * from './lib/constraint-solver';
export * from './lib/candidate-scorer';
export * from './lib/grammar-resolver';
export * from './lib/word-selector';
export * from './lib/default-completion-strategy';
export * from './lib/auto-completion-engine';
