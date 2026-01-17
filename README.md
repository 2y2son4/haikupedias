# Haikupedias

Haikupedias is an experimental web-based poetry and music generator.

Users compose a short poem by selecting words, and the system translates those choices into musical compositions with multiple arrangement styles and sound options.

This project explores:

- Algorithmic composition
- Constraint-based creativity
- Scalable frontend architecture
- Multiple musical interpretation systems

## Tech Stack

- Angular 21 (standalone APIs)
- NX Monorepo
- Web Audio API
- Tone.js (for advanced synthesis and real instrument samples)

## Concept

Each generated piece — a _Haikupedia_ — is both:

- A textual micro-poem (haiku structure)
- A musical composition with multiple interpretations

The system offers two distinct musical arrangement styles:

### Gymnopédie Style

Inspired by Erik Satie's _Gymnopédies_, this arrangement creates:

- Sparse, contemplative texture
- First note played alone (tonic)
- Following notes as a simultaneous chord
- Dreamy, atmospheric character

### Dodecaphonic Style

Inspired by twelve-tone technique, this arrangement creates:

- Sequential, melodic texture
- All notes played one after another
- Linear, atonal character
- Completes the chromatic scale by inserting missing notes

## Sound Options

The application provides four distinct sound engines:

1. **Synthetic**: Pure sine wave synthesis using Web Audio API
   - Classic electronic sound
   - Supports offline rendering (downloadable)

2. **Piano (Synth)**: FM synthesis using Tone.js
   - Rich, piano-like timbres
   - Real-time synthesis

3. **Piano (Samples)**: Real piano recordings
   - Authentic piano sound
   - Samples from tonejs-instruments library

4. **Instruments**: 19 orchestral and band instruments
   - Bass Electric, Bassoon, Cello, Clarinet, Contrabass
   - Flute, French Horn, Acoustic Guitar, Electric Guitar
   - Harmonium, Harp, Organ, Piano, Saxophone
   - Trombone, Trumpet, Tuba, Violin, Xylophone
   - High-quality samples from tonejs-instruments CDN

## Project Structure

```
apps/
  haikupedias-shell/      # Main Angular application

libs/
  core/
    types/               # Shared TypeScript interfaces
    utils/               # Pure utility functions
```

## Getting Started

### Prerequisites

- Node.js 22+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm start
# Application will be available at http://localhost:4200
```

### Build

```bash
npm run build
```

## Status

V1 — Multiple arrangement styles (Gymnopédie & Dodecaphonic) with 4 sound engines

## Musical Features

### Composition Algorithm

- Maps word tonality groups to musical intervals
- Two-bar structure with harmonic progressions
- Deterministic: same words always produce the same composition

### Arrangement Styles

- **Gymnopédie**: Chordal texture with bass note + chord pattern
- **Dodecaphonic**: Linear melodic texture with complete 12-tone rows

### Sound Engines

- **Web Audio API**: Native browser synthesis for core functionality
- **Tone.js**: Advanced FM synthesis and sample playback
- **tonejs-instruments**: High-quality instrument sample library

## Disclaimer

This project is inspired by classical music but does not attempt faithful reproduction.
It is an artistic and technical exploration.

## Architecture Principles

1. **Domain separation**: UI, poetry, and music logic are strictly separated
2. **NX boundaries**: Each library has clear responsibility and dependencies
3. **Deterministic generation**: Same word selection always produces same output
4. **Standalone Angular**: No NgModules, uses modern Angular patterns
5. **Type safety**: Strict TypeScript configuration throughout

## Future Plans

- Additional poetic universes
- More musical arrangement styles
- Module Federation for dynamic universe loading
- Additional instruments and sound libraries

---

_An exploration of constraint, code, and composition._

```
haikupedias
├─ .nx
│  └─ nxw.js
├─ .prettierignore
├─ .prettierrc
├─ apps
│  └─ haikupedias-shell
│     ├─ project.json
│     ├─ src
│     │  ├─ app
│     │  │  ├─ app.component.html
│     │  │  ├─ app.component.scss
│     │  │  ├─ app.component.ts
│     │  │  ├─ app.config.ts
│     │  │  ├─ app.routes.ts
│     │  │  └─ pages
│     │  │     ├─ home
│     │  │     │  ├─ home.component.html
│     │  │     │  ├─ home.component.scss
│     │  │     │  └─ home.component.ts
│     │  │     └─ lexicon
│     │  │        ├─ lexicon.component.html
│     │  │        ├─ lexicon.component.scss
│     │  │        └─ lexicon.component.ts
│     │  ├─ index.html
│     │  ├─ main.ts
│     │  └─ styles.scss
│     ├─ tsconfig.app.json
│     └─ tsconfig.json
├─ eslint.config.mjs
├─ jest.config.ts
├─ jest.preset.js
├─ libs
│  ├─ core
│  │  ├─ types
│  │  │  ├─ project.json
│  │  │  ├─ README.md
│  │  │  ├─ src
│  │  │  │  ├─ index.ts
│  │  │  │  └─ lib
│  │  │  │     ├─ haikupedia.types.ts
│  │  │  │     ├─ music.types.ts
│  │  │  │     └─ poetry.types.ts
│  │  │  ├─ tsconfig.json
│  │  │  └─ tsconfig.lib.json
│  │  └─ utils
│  │     ├─ project.json
│  │     ├─ README.md
│  │     ├─ src
│  │     │  ├─ index.ts
│  │     │  └─ lib
│  │     │     ├─ constants.ts
│  │     │     └─ note-utils.ts
│  │     ├─ tsconfig.json
│  │     └─ tsconfig.lib.json
│  ├─ design-tokens
│  │  ├─ eslint.config.mjs
│  │  ├─ jest.config.cts
│  │  ├─ project.json
│  │  ├─ README.md
│  │  ├─ src
│  │  │  ├─ index.ts
│  │  │  ├─ lib
│  │  │  │  ├─ _colors.scss
│  │  │  │  ├─ _elevation.scss
│  │  │  │  ├─ _index.scss
│  │  │  │  ├─ _motion.scss
│  │  │  │  ├─ _palette-dark.scss
│  │  │  │  ├─ _palette.scss
│  │  │  │  ├─ _spacing.scss
│  │  │  │  └─ _typography.scss
│  │  │  └─ test-setup.ts
│  │  ├─ tsconfig.json
│  │  ├─ tsconfig.lib.json
│  │  └─ tsconfig.spec.json
│  ├─ music
│  │  ├─ arrangers
│  │  │  ├─ base-arranger
│  │  │  │  ├─ project.json
│  │  │  │  ├─ README.md
│  │  │  │  ├─ src
│  │  │  │  │  ├─ index.ts
│  │  │  │  │  └─ lib
│  │  │  │  │     └─ composition-arranger.interface.ts
│  │  │  │  ├─ tsconfig.json
│  │  │  │  └─ tsconfig.lib.json
│  │  │  ├─ dodecaphonic-arranger
│  │  │  │  ├─ project.json
│  │  │  │  ├─ README.md
│  │  │  │  ├─ src
│  │  │  │  │  ├─ index.ts
│  │  │  │  │  └─ lib
│  │  │  │  │     └─ dodecaphonic-arranger.ts
│  │  │  │  ├─ tsconfig.json
│  │  │  │  └─ tsconfig.lib.json
│  │  │  └─ gymnopedie-arranger
│  │  │     ├─ project.json
│  │  │     ├─ README.md
│  │  │     ├─ src
│  │  │     │  ├─ index.ts
│  │  │     │  └─ lib
│  │  │     │     └─ gymnopedie-arranger.ts
│  │  │     ├─ tsconfig.json
│  │  │     └─ tsconfig.lib.json
│  │  ├─ audio
│  │  │  ├─ eslint.config.mjs
│  │  │  ├─ package.json
│  │  │  ├─ project.json
│  │  │  ├─ README.md
│  │  │  ├─ src
│  │  │  │  ├─ index.ts
│  │  │  │  └─ lib
│  │  │  │     ├─ audio-context.ts
│  │  │  │     ├─ composition-player.ts
│  │  │  │     ├─ instrument-note-player.ts
│  │  │  │     ├─ models
│  │  │  │     │  └─ music-audio.model.ts
│  │  │  │     ├─ note-frequency.ts
│  │  │  │     ├─ note-player.ts
│  │  │  │     ├─ piano-note-player.ts
│  │  │  │     ├─ piano-synth-note-player.ts
│  │  │  │     ├─ static
│  │  │  │     │  └─ notes.ts
│  │  │  │     └─ synthetic-note-player.ts
│  │  │  ├─ tsconfig.json
│  │  │  └─ tsconfig.lib.json
│  │  ├─ composition-engine
│  │  │  ├─ eslint.config.mjs
│  │  │  ├─ project.json
│  │  │  ├─ README.md
│  │  │  ├─ src
│  │  │  │  ├─ index.ts
│  │  │  │  └─ lib
│  │  │  │     ├─ composition-engine.ts
│  │  │  │     ├─ composition-formatter.ts
│  │  │  │     └─ composition-generator.ts
│  │  │  ├─ tsconfig.json
│  │  │  └─ tsconfig.lib.json
│  │  └─ theory
│  │     ├─ eslint.config.mjs
│  │     ├─ project.json
│  │     ├─ README.md
│  │     ├─ src
│  │     │  ├─ index.ts
│  │     │  └─ lib
│  │     │     ├─ intervals.ts
│  │     │     ├─ note-arithmetic.ts
│  │     │     └─ theory.ts
│  │     ├─ tsconfig.json
│  │     └─ tsconfig.lib.json
│  ├─ poetry
│  │  ├─ haiku-engine
│  │  │  ├─ eslint.config.mjs
│  │  │  ├─ project.json
│  │  │  ├─ README.md
│  │  │  ├─ src
│  │  │  │  ├─ index.ts
│  │  │  │  └─ lib
│  │  │  │     ├─ haiku-builder.ts
│  │  │  │     ├─ haiku-engine.ts
│  │  │  │     └─ haiku-validator.ts
│  │  │  ├─ tsconfig.json
│  │  │  └─ tsconfig.lib.json
│  │  └─ lexicon
│  │     ├─ project.json
│  │     ├─ README.md
│  │     ├─ README.pdf
│  │     ├─ src
│  │     │  ├─ index.ts
│  │     │  └─ lib
│  │     │     ├─ word-set-a.ts
│  │     │     └─ word-set-b.ts
│  │     ├─ tsconfig.json
│  │     └─ tsconfig.lib.json
│  ├─ design-tokens
│  └─ ui
│     └─ components
│        ├─ eslint.config.mjs
│        ├─ jest.config.cts
│        ├─ eslint.config.mjs
│        ├─ jest.config.cts
│        ├─ ng-package.json
│        ├─ package.json
│        ├─ project.json
│        ├─ README.md
│        ├─ src
│        │  ├─ index.ts
│        │  ├─ lib
│        │  │  ├─ audio-controls
│        │  │  │  ├─ audio-controls.component.html
│        │  │  │  ├─ audio-controls.component.scss
│        │  │  │  └─ audio-controls.component.ts
│        │  │  ├─ components
│        │  │  │  ├─ components.css
│        │  │  │  ├─ components.html
│        │  │  │  └─ components.ts
│        │  │  ├─ haiku-display
│        │  │  │  ├─ haiku-display.component.html
│        │  │  │  ├─ haiku-display.component.scss
│        │  │  │  └─ haiku-display.component.ts
│        │  │  └─ word-selector
│        │  │     ├─ word-selector.component.html
│        │  │     ├─ word-selector.component.scss
│        │  │     └─ word-selector.component.ts
│        │  └─ test-setup.ts
│        ├─ tsconfig.json
│        ├─ tsconfig.lib.json
│        ├─ tsconfig.lib.prod.json
│        └─ tsconfig.spec.json
├─ nx.json
├─ package-lock.json
├─ package.json
├─ README.md
├─ STRUCTURE.md
└─ tsconfig.base.json

```