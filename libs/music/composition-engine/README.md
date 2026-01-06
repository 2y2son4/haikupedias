# music/composition-engine

Gymnopédie-inspired composition engine for generating musical pieces from haiku structures.

## Purpose

This library transforms haiku poetry into musical compositions by:

- Mapping word tonality groups to musical intervals
- Implementing a Gymnopédie-inspired two-bar structure
- Generating harmonic progressions from word selections
- Creating complete Composition objects ready for audio playback

## Algorithm

The composition follows a strict two-bar pattern inspired by Satie's Gymnopédies:

### Bar 1

- **Tonic**: Randomly selected note (0-11)
- **Steps**: 4 harmonic steps, one per word
- **Intervals**: Major 3rd (4 semitones) for "major" words, Minor 3rd (3 semitones) for "minor" words

### Bar 2

- **Tonic**: Dominant of Bar 1 tonic (7 semitones above)
- **Steps**: 4 harmonic steps, one per word
- **Intervals**: Same tonality mapping as Bar 1

## Tonality Mapping

Words have tonality groups that determine musical intervals:

- **Major tonality** (bright, uplifting) → Major 3rd (4 semitones)
- **Minor tonality** (contemplative, melancholic) → Minor 3rd (3 semitones)

Example:

```typescript
// Word: "cloud" (minor tonality) → Minor 3rd
// Word: "shine" (major tonality) → Major 3rd
```

## Usage

### Generate Composition from Haiku

```typescript
import { CompositionGenerator } from '@haikupedias/music/composition-engine';
import { HaikuBuilder } from '@haikupedias/poetry/haiku-engine';
import { WORD_SET_A } from '@haikupedias/poetry/lexicon';

// Build a haiku
const words = WORD_SET_A.slice(0, 8);
const haikuResult = HaikuBuilder.buildFromArray(words);

if (haikuResult.success && haikuResult.haiku) {
  // Generate composition
  const composition = CompositionGenerator.generate(haikuResult.haiku);

  console.log('Composition generated!');
  console.log('Bar 1 tonic:', composition.bars[0].tonic);
  console.log('Bar 2 tonic:', composition.bars[1].tonic);
}
```

### Format Composition for Display

```typescript
import { CompositionFormatter } from '@haikupedias/music/composition-engine';

// Format full composition
const formatted = CompositionFormatter.format(composition);
console.log(formatted);
/*
🎵 Composition

Bar 1 (Tonic: C)
  Step 1: C + Minor 3rd → Eb
  Step 2: Eb + Major 3rd → G
  Step 3: G + Minor 3rd → Bb
  Step 4: Bb + Major 3rd → D

Bar 2 (Tonic: G)
  Step 1: G + Minor 3rd → Bb
  ...
*/

// Get note sequence
const notes = CompositionFormatter.getNoteSequence(composition);
console.log(notes); // [0, 3, 7, 10, 2, 7, 10, ...]

// Format as note names
const noteNames = CompositionFormatter.formatNoteSequence(composition);
console.log(noteNames); // "C → Eb → G → Bb → D → G → ..."
```

## Data Structures

### Composition

```typescript
interface Composition {
  bars: [Bar, Bar]; // Always exactly 2 bars
}
```

### Bar

```typescript
interface Bar {
  tonic: NoteValue; // Starting note (0-11)
  steps: HarmonicStep[]; // 4 harmonic steps
}
```

### HarmonicStep

```typescript
interface HarmonicStep {
  root: NoteValue; // Starting note
  interval: number; // 3 (minor 3rd) or 4 (major 3rd)
  result: NoteValue; // Resulting note after applying interval
}
```

## Musical Context

The algorithm captures the essence of Gymnopédies:

- **Simplicity**: Two bars, clear structure
- **Repetition**: Same pattern in both bars with different tonics
- **Harmony**: Third-based intervals create consonant progressions
- **Mood**: Tonality groups preserve emotional content from words

## Example Output

For a haiku with these words and tonalities:

```
Line 1: "cloud" (minor), "drifts" (minor)
Line 2: "silent" (minor), "whisper" (minor), "fades" (minor), "softly" (minor)
Line 3: "twilight" (minor), "falls" (minor)
```

Might generate:

```
Bar 1 (Tonic: C/0)
  C + minor 3rd → Eb
  Eb + minor 3rd → Gb
  Gb + minor 3rd → A
  A + minor 3rd → C

Bar 2 (Tonic: G/7)
  G + minor 3rd → Bb
  Bb + minor 3rd → Db
  Db + minor 3rd → E
  E + minor 3rd → G
```

Result: A melancholic, circular progression perfectly suited for contemplative haiku.

## Dependencies

- `@haikupedias/core/types` - Haiku, Word, Composition, Bar, HarmonicStep
- `@haikupedias/core/utils` - Musical constants, randomNote(), noteToName()
- `@haikupedias/music/theory` - addInterval(), getDominant()

## Integration

The composition engine is the bridge between poetry and music:

1. **Input**: Haiku (from haiku-engine)
2. **Process**: Map words → notes → intervals → harmonic steps
3. **Output**: Composition (for audio-engine)

Next in the pipeline: The audio-engine will take these compositions and render them as actual sound using Web Audio API.
