# music/theory

Music theory utilities for Haikupedias composition engine.

## Purpose

This library provides fundamental music theory operations:

- Note arithmetic within the chromatic scale (0-11)
- Interval calculations (major/minor thirds, dominant)
- Note transposition and distance calculations
- Harmonic sequence generation

## Core Concepts

### Chromatic Scale

Notes are represented as integers 0-11:

- 0 = C, 1 = C#, 2 = D, 3 = D#, 4 = E, 5 = F
- 6 = F#, 7 = G, 8 = G#, 9 = A, 10 = A#, 11 = B

All operations wrap around at 12 (the chromatic scale).

### Intervals

- **Major Third**: 4 semitones (e.g., C → E)
- **Minor Third**: 3 semitones (e.g., C → Eb)
- **Dominant**: 7 semitones / Perfect Fifth (e.g., C → G)

## API

### Note Arithmetic

```typescript
import {
  addInterval,
  subtractInterval,
  getIntervalDistance,
  transpose,
  isValidNote,
} from '@haikupedias/music/theory';

// Add intervals
const e = addInterval(0, 4); // C + major third = E (4)

// Subtract intervals
const g = subtractInterval(0, 5); // C - 5 = G (7) [wraps around]

// Calculate distance between notes
const distance = getIntervalDistance(0, 7); // C to G = 5 semitones

// Transpose notes
const d = transpose(0, 2); // C up 2 semitones = D

// Validate note values
if (isValidNote(5)) {
  console.log('F is valid!');
}
```

### Harmonic Intervals

```typescript
import {
  getMajorThird,
  getMinorThird,
  getDominant,
  generateSequence,
} from '@haikupedias/music/theory';

const root = 0; // C

// Generate intervals from root
const majorThird = getMajorThird(root); // E (4)
const minorThird = getMinorThird(root); // Eb (3)
const dominant = getDominant(root); // G (7)

// Generate a sequence
const sequence = generateSequence(0, [4, 3, 5]);
// [C(0), E(4), G(7), C(0)] - major chord arpeggio
```

## Musical Context

This library supports the Gymnopédie-inspired composition algorithm:

1. **Bar 1**: Uses random tonic + major/minor thirds for 4 steps
2. **Bar 2**: Uses dominant of Bar 1 tonic + 4 steps

The tonality groups from words determine interval choices:

- **Major tonality** → Use major thirds (4 semitones)
- **Minor tonality** → Use minor thirds (3 semitones)

## Dependencies

- `@haikupedias/core/types` - NoteValue type definition
- `@haikupedias/core/utils` - Musical constants (CHROMATIC_SCALE, intervals)

## Usage in Composition Engine

The composition engine uses these utilities to:

1. Generate random starting notes (tonics)
2. Calculate dominant notes for second bar
3. Apply major/minor thirds based on word tonality
4. Build harmonic sequences that follow Gymnopédie patterns

## Examples

### Creating a Simple Melody

```typescript
import { addInterval } from '@haikupedias/music/theory';
import { MAJOR_THIRD, MINOR_THIRD } from '@haikupedias/core/utils';

const tonic = 0; // C
const melody = [
  tonic,
  addInterval(tonic, MAJOR_THIRD), // E
  addInterval(tonic, MINOR_THIRD), // Eb
  tonic,
];
// Result: [0, 4, 3, 0] = C, E, Eb, C
```

### Transposing a Pattern

```typescript
import { transpose, generateSequence } from '@haikupedias/music/theory';

const pattern = [0, 4, 7]; // C major triad
const transposed = pattern.map((note) => transpose(note, 5));
// Result: [5, 9, 0] = F major triad (F, A, C)
```
