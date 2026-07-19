# @haikupedias/poetry/auto-completion

**Automatic poetic completion engine for Haikupedias.**

Transforms user interactions from selecting every word into collaborative poetry composition: the user chooses the words they care about, and the engine automatically fills the rest while respecting poetic structure, grammatical coherence, and aesthetic conventions.

---

## Overview

### Vision

Haikupedias should feel less like a form and more like writing together with a silent poet.

Instead of requiring users to choose every single word, they select only the words they care about. The system automatically completes the remaining blanks while maintaining poetic beauty, grammatical consistency, and the contemplative mood.

### Core Principles

1. **The user owns their words** — user-selected words are never modified.
2. **Generated words are disposable** — they may be regenerated individually without affecting user selections.
3. **Every blank has meaning** — each blank represents a constrained poetic decision.
4. **Completion should feel invisible** — no explicit "generate" button required; it happens automatically.

---

## Architecture

### Key Classes

#### AutoCompletionEngine

Central orchestrator and main entry point.

```typescript
const engine = new AutoCompletionEngine(wordPool);

// Complete a poem with user selections
const result = engine.complete(
  new Map([
    [0, shadowWord],
    [3, moonWord],
  ]),
);

// Regenerate a single slot
const updated = engine.regenerateSlot('slot-2', result.slots);
```

**Responsibilities:**

- Build the initial slot template.
- Freeze user-selected words.
- Fill every empty slot using the configured strategy.
- Expose individual slot regeneration.
- Delegate grammar side-effects.

#### PoeticSlot

A constrained word position in the haiku.

```typescript
interface PoeticSlot {
  id: string; // "slot-0", "slot-3", etc.
  position: number; // Global 0-7 index
  lineIndex: 0 | 1 | 2; // Which line (1, 2, or 3)
  linePosition: number; // Index within the line
  value: Word | undefined; // Current word or empty
  origin: 'user' | 'generated'; // Who chose it
  editable: boolean; // Always true; regeneration happens through the engine
  constraints: SlotConstraint[]; // Ordered list of requirements
}
```

**Constraints** (discriminated union):

- **WordTypeConstraint** — Hard: word must be noun/verb/adjective/adverb.
- **TonalityPreferenceConstraint** — Soft: favour major or minor tonality.
- **NoRepeatConstraint** — Hard: word must not be in the exclusion list.
- **PositionRoleConstraint** — Soft: word should fit the line role (opener/middle/closer).

#### ConstraintSolver

Filters candidates to satisfy hard constraints.

Hard constraints (enforced):

- Word type matching.
- No repetition.

Soft constraints (handled by scorer):

- Tonality preferences.
- Position roles.

If no candidates survive the filtering, the full word pool is returned so the poem can still be completed.

#### CandidateScorer

Ranks pre-filtered candidates by aesthetic fit.

Scoring dimensions:

1. **Tonality alignment** (3x weight) — coherence with the dominant mood.
2. **Position role** (2x weight) — fit for opener/middle/closer.
3. **Label length** (1x weight) — shorter words flow more musically.

Positioned preferences (conventions):

- **Opener** → adjective > noun > adverb > verb
- **Middle** → noun > verb > adjective > adverb
- **Closer** → verb > adverb > noun > adjective

#### WordSelector

Selects a single word from a ranked list.

```typescript
// Top candidate (default)
const word = selector.select(scored);

// Second-best (offset=1)
const alternative = selector.select(scored, 1);

// Cycles: if offset >= candidates.length, wraps around
```

Selection is deterministic: the same inputs always produce the same output.

#### GrammarResolver

Determines which generated neighbours need re-solving after a change.

**Current logic:** If a user changes a word to a different tonality, neighbouring generated words on the same line that have misaligned tonality are flagged for regeneration.

This keeps the poem tonally coherent without modifying user choices.

#### DefaultCompletionStrategy

Built-in strategy implementing the standard filling algorithm.

1. Process slots left to right.
2. For each empty slot: solve constraints → score candidates → select best → track used words.
3. Inject a `no-repeat` constraint so each position receives a unique word.

#### buildBlankSlots()

Creates the initial 8-slot template for a new poem.

```typescript
const blank = buildBlankSlots('major');
// Returns 8 PoeticSlots, all empty, with soft constraints based on SLOT_META
```

Positional defaults (2-4-2 structure):

- **Line 1, position 0** → opener (adjective preferred)
- **Line 1, position 1** → closer (noun preferred)
- **Line 2, positions 0–3** → opener/middle/middle/closer (specific roles)
- **Line 3, positions 0–1** → opener/closer (adjective/verb preferred)

#### mergeUserWords()

Overlays user selections onto a blank template.

```typescript
const merged = mergeUserWords(
  blank,
  new Map([
    [0, userWord1],
    [3, userWord2],
  ]),
);
// Slots 0 and 3 are now frozen; rest remain empty
```

---

## Usage

### Basic Completion

```typescript
import { AutoCompletionEngine } from '@haikupedias/poetry/auto-completion';
import { WORD_SET_A } from '@haikupedias/poetry/lexicon';

const engine = new AutoCompletionEngine(WORD_SET_A);

// User selects "shadow" (id="a-n-13") for position 0
const result = engine.complete(new Map([[0, shadowWord]]));

console.log(result.words); // [shadow, <generated>, <generated>, ...]
console.log(result.slots); // 8 PoeticSlots with values and metadata
```

### Individual Regeneration

```typescript
// User clicks "regenerate" on position 3
const updated = engine.regenerateSlot('slot-3', result.slots);

// Or cycle through alternatives
const alt2 = engine.regenerateSlot('slot-3', result.slots, { offset: 1 });
const alt3 = engine.regenerateSlot('slot-3', result.slots, { offset: 2 });
```

### Integration with UI

```typescript
// When user changes a selection (e.g., slot 0 → different word)
const userWords = new Map([[0, newSelectionFromUser]]);
const result = engine.complete(userWords);

// Update the UI with result.words (for haiku-display)
// and result.slots (for metadata / regeneration actions)
```

---

## Design Decisions

### No AI or LLMs

Generation is deterministic constraint-solving, not ML inference.

### Strategy Pattern

`CompletionStrategy` is an interface; custom strategies can be plugged in for different universes (sonnets, tanka, etc.).

### Separated Concerns

- **Solver** handles constraints; doesn't rank.
- **Scorer** ranks; doesn't filter hard constraints.
- **Selector** picks; doesn't score.
- **Engine** orchestrates; delegates to all three.

### No Validation

The engine produces candidate poems but does **not** validate haiku structure, syllable count, or poetic form. That responsibility remains with `HaikuEngine` (validation) and `HaikuBuilder` (assembly).

### Tonality as Anchor

When multiple user words are present, their tonality is averaged to infer the poem's mood. This drives soft preferences across all generated words, keeping the piece coherent without forcing every word into a single tonality.

---

## Extension Points

### Custom Strategy

```typescript
class MyStrategy implements CompletionStrategy {
  fill(slots: PoeticSlot[], wordPool: Word[]): PoeticSlot[] {
    // Your logic here
  }
}

const engine = new AutoCompletionEngine(wordPool, new MyStrategy());
```

### Custom Scoring

```typescript
const scorer = new CandidateScorer({
  tonalityAlignment: 5, // Emphasise mood
  positionRole: 1,
  labelLength: 0.5,
});
const strategy = new DefaultCompletionStrategy(solver, scorer, selector);
const engine = new AutoCompletionEngine(wordPool, strategy);
```

### Custom Grammar Rules

```typescript
class MyGrammarResolver extends GrammarResolver {
  resolve(slot, allSlots) {
    // Your grammar logic
  }
}

const engine = new AutoCompletionEngine(
  wordPool,
  strategy,
  new MyGrammarResolver(),
);
```

---

## Testing

### Unit Tests

Each class is testable in isolation:

```typescript
// ConstraintSolver
const solver = new ConstraintSolver();
const filtered = solver.resolve(slotWithConstraints, wordPool);

// CandidateScorer
const scorer = new CandidateScorer();
const scored = scorer.score(filtered, slot);

// WordSelector
const selector = new WordSelector();
const selected = selector.select(scored, 0);
```

### Integration Tests

```typescript
const engine = new AutoCompletionEngine(WORD_SET_A);
const result = engine.complete(userSelections);
// Assert result.words has 8 elements, all populated.
// Pass result.words to HaikuBuilder.buildFromArray() and validate.
```

---

## Non-Goals

- Introducing AI or LLMs.
- Hardcoding complete poems.
- Generating random words without validation.
- Duplicating existing poetry-engine responsibilities.

---

## See Also

- [Haikupedias V3 — Automatic Poetic Comp.md](../../../Haikupedias%20V3%20—%20Automatic%20Poetic%20Comp.md) — product vision and design philosophy.
- [@haikupedias/poetry/haiku-engine](../haiku-engine/README.md) — validates and assembles completed haikus.
- [@haikupedias/poetry/lexicon](../lexicon/README.md) — word datasets (WORD_SET_A, WORD_SET_B).
