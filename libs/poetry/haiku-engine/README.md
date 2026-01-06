# poetry/haiku-engine

Engine for building and validating haiku structures in Haikupedias.

## Purpose

This library provides the core logic for:

- Validating haiku structure (2-4-2 word pattern)
- Building Haiku objects from selected words
- Ensuring word uniqueness and proper distribution
- Providing detailed validation error messages

## Structure

The library follows the strict Haikupedias haiku format:

- **Line 1**: 2 words
- **Line 2**: 4 words
- **Line 3**: 2 words
- **Total**: 8 unique words

## Core Components

### HaikuBuilder

Service for building haiku structures from word selections.

```typescript
import { HaikuBuilder } from '@haikupedias/poetry/haiku-engine';

// Build from separate line arrays
const result = HaikuBuilder.build(
  [word1, word2], // Line 1: 2 words
  [word3, word4, word5, word6], // Line 2: 4 words
  [word7, word8], // Line 3: 2 words
);

if (result.success) {
  console.log(result.haiku);
} else {
  console.error(result.errors);
}

// Build from flat array (auto-distributes 2-4-2)
const autoResult = HaikuBuilder.buildFromArray([
  word1,
  word2,
  word3,
  word4,
  word5,
  word6,
  word7,
  word8,
]);
```

### Validation Functions

Individual validation utilities for specific checks:

```typescript
import {
  validateTotalWords,
  validateLineDistribution,
  validateUniqueWords,
  validateHaiku,
} from '@haikupedias/poetry/haiku-engine';

// Check total word count (must be 8)
const totalCheck = validateTotalWords(selectedWords);

// Check line distribution (2-4-2)
const lineCheck = validateLineDistribution(line1, line2, line3);

// Check for duplicate words
const uniqueCheck = validateUniqueWords(allWords);

// Complete validation
const fullCheck = validateHaiku(line1, line2, line3);
```

## Validation Rules

1. **Total Count**: Exactly 8 words must be selected
2. **Line Distribution**: Words must follow 2-4-2 pattern
3. **Uniqueness**: No word can appear twice in the same haiku
4. **Type Safety**: All words must implement the Word interface

## Error Handling

All validation functions return a `HaikuValidationResult`:

```typescript
interface HaikuValidationResult {
  valid: boolean;
  errors: string[]; // Detailed error messages
}
```

The `HaikuBuilder` returns a `HaikuBuildResult`:

```typescript
interface HaikuBuildResult {
  success: boolean;
  haiku?: Haiku; // Present if success is true
  errors?: string[]; // Present if success is false
}
```

## Dependencies

- `@haikupedias/core/types` - Word, Haiku, HaikuLine interfaces
- `@haikupedias/core/utils` - HAIKU_LINE_LENGTHS, WORDS_TOTAL constants

## Usage in Application

This library is used by the UI layer to:

1. Validate user word selections in real-time
2. Build Haiku objects for composition generation
3. Display helpful error messages when selections are invalid
4. Enable/disable composition generation based on validation state
