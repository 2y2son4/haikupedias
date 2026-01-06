# Haikupedias

Haikupedias is an experimental web-based poetry and music generator.

Users compose a short poem by selecting words, and the system translates those choices into a short musical composition inspired by Erik Satie's _Gymnopédies_.

This project explores:

- Algorithmic composition
- Constraint-based creativity
- Scalable frontend architecture

## Tech Stack

- Angular (standalone APIs)
- NX Monorepo
- Web Audio API

## Concept

Each generated piece — a _Haikupedia_ — is both:

- A textual micro-poem
- A two-bar musical gesture

The system is designed as a foundation for multiple future poetic and musical "universes".

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

V1 — Single universe (Gymnopédie-inspired)

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
- Alternative musical rule systems
- Module Federation for dynamic universe loading

---

_An exploration of constraint, code, and composition._
