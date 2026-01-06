# @haikupedias/poetry/lexicon

Word datasets for the Haikupedias project.

## Contents

This library provides two curated word sets for composing haikupedias:

### Word Set A — Contemplative & Natural
- **Theme**: Nature, contemplation, quiet moments
- **Mood**: Meditative, peaceful, introspective
- **Count**: 90 words
- **Distribution**:
  - 24 nouns (12 major, 12 minor)
  - 24 adjectives (12 major, 12 minor)
  - 24 verbs (12 major, 12 minor)
  - 12 adverbs (6 major, 6 minor)

### Word Set B — Dynamic & Urban
- **Theme**: Movement, energy, contemporary life
- **Mood**: Energetic, intense, urban
- **Count**: 90 words
- **Distribution**: Same as Set A

## Usage

```typescript
import { WORD_SET_A, WORD_SET_B, Word } from '@haikupedias/poetry/lexicon';

// Access all words from Set A
const wordsA: Word[] = WORD_SET_A;

// Filter by type
const nouns = WORD_SET_A.filter(w => w.type === 'noun');
const verbs = WORD_SET_A.filter(w => w.type === 'verb');

// Filter by tonality
const majorWords = WORD_SET_A.filter(w => w.tonalityGroup === 'major');
const minorWords = WORD_SET_A.filter(w => w.tonalityGroup === 'minor');
```

## Word Structure

Each word object contains:
- `id`: Unique identifier (e.g., "a-n-01")
- `label`: The word text
- `type`: Grammatical category (noun, verb, adjective, adverb)
- `tonalityGroup`: Musical mapping (major, minor)

## Tonality Assignment

Words are assigned to major or minor groups based on their emotional quality:
- **Major**: Bright, uplifting, open feelings
- **Minor**: Contemplative, melancholic, introspective feelings

This mapping drives the musical composition algorithm.

## No Angular Dependencies

This is a pure data library with no framework dependencies.
