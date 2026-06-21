# Haikupedias & Dodecaikus

Haikupedias is an Nx monorepo for generating short poems and turning them into playable music.

The current application includes two creation modes:

- Haikupedia mode: 8 words arranged as 2-4-2
- Dodecaiku mode: 12 words arranged as 3-6-3

Each generated poem can be rendered as a musical composition with selectable arrangement and sound engines.

## Current Features

### Creation Modes

- Haikupedia (2-4-2 word structure)
- Dodecaiku (3-6-3 word structure)
- Random word selection via "I'm feeling lucky"
- Editable poem review before locking final creation

### Musical Interpretation

- Gymnopedie arranger
- Dodecaphonic arranger (12-tone completion)
- Visual composition structure preview in the UI
- Playback highlighting synced between words and notes

### Audio Engines

- Synthetic (Web Audio API)
- Piano Synth
- Piano Samples
- Instruments (multiple sampled instruments)

### Application Pages

- Home: end-to-end poem and composition workflow
- Lexicon: browse both vocabulary sets by part of speech and tonality group

## Tech Stack

- Angular 21 (standalone APIs)
- Nx 22 workspace
- TypeScript (strict mode)
- Sass
- Jest + ESLint
- Web Audio API + Tone.js

## Workspace Structure

```text
apps/
   haikupedias-shell/                Main Angular application

libs/
   core/
      types/                          Shared domain types
      utils/                          Shared constants and note helpers

   poetry/
      lexicon/                        Word sets and lexicon exports
      haiku-engine/                   Haiku and dodecaiku builders/validation

   music/
      theory/                         Music theory primitives
      composition-engine/             Composition generators/formatters
      audio/                          Playback engine and note players
      arrangers/
         base-arranger/                Arranger contracts and scheduled-note model
         gymnopedie-arranger/          Chordal interpretation
         dodecaphonic-arranger/        12-tone row interpretation

   ui/
      components/                     Reusable standalone UI components

   design-tokens/                    Shared style tokens and Sass utilities
```

## Nx Projects

Application:

- haikupedias-shell

Libraries:

- core-types
- core-utils
- poetry-lexicon
- haiku-engine
- theory
- composition-engine
- audio
- base-arranger
- gymnopedie-arranger
- dodecaphonic-arranger
- components
- design-tokens

## Getting Started

### Prerequisites

- Node.js 22+
- npm

### Install

```bash
npm install
```

### Run the app

```bash
npm start
```

The dev server runs the `haikupedias-shell` app (default: <http://localhost:4200>).

## Useful Commands

Root npm scripts:

```bash
npm start
npm run build
npm run build:all
npm test
npm run lint
```

Direct Nx examples:

```bash
nx serve haikupedias-shell
nx build haikupedias-shell
nx run-many --target=build --all
nx test
nx lint
nx show projects
```

## Path Aliases

Common aliases from `tsconfig.base.json`:

- @haikupedias/core/types
- @haikupedias/core/utils
- @haikupedias/poetry/lexicon
- @haikupedias/poetry/haiku-engine
- @haikupedias/music/theory
- @haikupedias/music/composition-engine
- @haikupedias/music/audio
- @haikupedias/music/arrangers/base-arranger
- @haikupedias/music/arrangers/gymnopedie-arranger
- @haikupedias/music/arrangers/dodecaphonic-arranger
- @haikupedias/ui/components
- @haikupedias/design-tokens

## Notes

- Architecture follows domain separation: `poetry`, `music`, `ui`, and shared `core`.
- The workspace is organized as an Nx monorepo with clear library boundaries.
- `tmp/` contains temporary/generated workspace artifacts and is not part of the public API surface.

## References

### Tone.js Documentation

<https://tonejs.github.io/>

### Tone.js Instruments

<https://nbrosowsky.github.io/tonejs-instruments/>

### Web Audio API

<https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API>
