# Haikupedias & Dodecaikus

Haikupedias is an algorithmic poetry and music generator. You build short structured poems from curated word sets, then turn them into playable musical compositions that are unique to each poem.

## Index

- [Haikupedias \& Dodecaikus](#haikupedias--dodecaikus)
  - [Index](#index)
  - [About the Project](#about-the-project)
  - [How to Use the App](#how-to-use-the-app)
    - [1. Choose a mode](#1-choose-a-mode)
    - [2. Pick your words](#2-pick-your-words)
    - [3. Review and lock](#3-review-and-lock)
    - [4. Listen to your composition](#4-listen-to-your-composition)
      - [Choose an Arranger](#choose-an-arranger)
      - [Choose an Audio Engine](#choose-an-audio-engine)
      - [Playback](#playback)
    - [5. Share or start over](#5-share-or-start-over)
  - [Browse the Lexicon](#browse-the-lexicon)
  - [Tech Stack](#tech-stack)
  - [Workspace Structure](#workspace-structure)
  - [Nx Projects](#nx-projects)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Install](#install)
    - [Run the app](#run-the-app)
  - [Useful Commands](#useful-commands)
  - [Path Aliases](#path-aliases)
  - [Notes](#notes)
  - [References](#references)
    - [Tone.js Documentation](#tonejs-documentation)
    - [Tone.js Instruments](#tonejs-instruments)
    - [Web Audio API](#web-audio-api)

---

## About the Project

Every word in the Haikupedias vocabulary is tagged with two musical attributes:

- **Tonality group** — major or minor. Major words have a bright character, minor words a darker one.
- **Part of speech** — noun, verb, adjective, adverb. These shape how words fit into the poem structure.

When you build a poem, the sequence of tonality groups and word positions determines the harmonic material. The same words in a different order produce different music. This means every poem has its own musical fingerprint — no two creations are alike.

The app is built with Angular, Tone.js, and the Web Audio API.

---

## How to Use the App

### 1. Choose a mode

On the Home page, select a poetic form:

| Mode | Structure | Description |
|------|-----------|-------------|
| **Haikupedia** | 2 – 4 – 2 words (8 total) | A compact poem with two single-word lines framing a four-word middle line |
| **Dodecaiku** | 3 – 6 – 3 words (12 total) | A longer form with three-word bookends around a six-word core |

### 2. Pick your words

The Home page shows two word sets (Set A and Set B). You'll also see the poem structure laid out as empty slots.

- Click a word to place it in the next available slot, or click a specific slot first then pick a word to fill it
- Swap between Set A and Set B to browse different vocabulary
- Use the **I'm feeling lucky** button to fill all empty slots randomly
- The tonality group (major/minor) of each word is shown — this directly affects how your poem will sound

### 3. Review and lock

Once all slots are filled, the poem preview area appears. You can:

- Tap any word to replace it
- Use **I'm feeling lucky** to randomise remaining unfilled slots
- When you're happy, **lock** the poem to finalise it

Locking triggers the musical arrangement and unlocks the playback controls.

### 4. Listen to your composition

The composition panel appears once your poem is locked. It shows a visual timeline of notes mapped to your words.

#### Choose an Arranger

| Arranger | Style |
|----------|-------|
| **Gymnopedie** | Chordal, ambient — each word becomes a soft chord. Inspired by Satie's _Gymnopédies_. |
| **Dodecaphonic** | 12-tone row — words are mapped to a tone row that completes a full chromatic cycle. |

Try both — the same poem sounds completely different under each arranger.

#### Choose an Audio Engine

| Engine | Description |
|--------|-------------|
| **Synthetic** | Web Audio API oscillator — lightweight, works everywhere |
| **Piano Synth** | Synthesized piano tone |
| **Piano Samples** | Sampled acoustic piano |
| **Instruments** | Multiple sampled instruments (strings, woodwinds, etc.) |

Some engines may take a moment to load on first use.

#### Playback

- Press **Play** to hear your composition from the beginning
- Words and notes highlight in sync as the composition plays, so you can follow along
- Switch arrangers or engines mid-playback — the sound updates immediately
- Toggle **loop** to repeat continuously

### 5. Share or start over

- Lock a new poem to replace the current one
- Change the mode to start fresh with a different structure

---

## Browse the Lexicon

The **Lexicon** page lets you explore both vocabulary sets independently of the creation workflow. Filter words by:

- **Part of speech** — noun, verb, adjective, adverb
- **Tonality group** — major, minor

This is useful for planning ahead or understanding the full range of available vocabulary.

---

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
- pnpm 10.12.4

### Install

```bash
pnpm install
```

### Run the app

```bash
pnpm start
```

The dev server runs the `haikupedias-shell` app (default: <http://localhost:4200>).

## Useful Commands

Root pnpm scripts:

```bash
pnpm start
pnpm run build
pnpm run build:prod
pnpm test
pnpm run lint
pnpm run build:prod:stats
pnpm run bundle:report
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
