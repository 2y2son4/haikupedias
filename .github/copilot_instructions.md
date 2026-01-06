# Copilot Instructions — Haikupedias (V1)

> **Audience**: AI coding agents (e.g. GitHub Copilot) working inside an IDE.
> **Goal**: Help the agent produce *correct, restrained, domain-aware code* for an artistic system.

This file **replaces** generic enterprise Copilot instructions. Follow it strictly.

---

## 1. Project Nature (Read First)

Haikupedias is **not** an enterprise application.
It is an **artistic, algorithmic poetry + music system**.

Primary values:
- Conceptual correctness
- Deterministic behavior
- Clear separation of domains
- Simplicity over feature richness

Avoid overengineering at all costs.

---

## 2. Architecture Overview

- **Nx monorepo**
- **Angular (standalone APIs only)**
- **Single application** in V1 (no micro-frontends yet)
- **No SSR**
- **No Module Federation in V1**

Future versions *may* introduce multiple “universes” and MFEs, but **do not anticipate them in code**.

---

## 3. Workspace Structure (Authoritative)

```
apps/
  haikupedias-shell/        # Main Angular application

libs/
  core/
    types/                 # Shared interfaces & enums
    utils/                 # Pure helpers (no Angular imports)

  poetry/
    lexicon/               # Word datasets & grammar groups
    haiku-engine/          # Haiku structure & validation

  music/
    theory/                # Notes, intervals, numeric logic
    composition-engine/    # Gymnopédie-inspired rules
    audio/                 # Web Audio API helpers

  ui/
    components/            # Reusable presentational components
```

### Boundary Rules

- UI libraries **must not** contain music logic
- Music libraries **must not** import Angular
- Poetry libraries **must not** depend on music libraries

Nx boundaries must be respected.

---

## 4. Angular Conventions

- Use **standalone components only**
- No `@NgModule`
- Bootstrap via `bootstrapApplication()`
- Configuration via `ApplicationConfig`
- Prefer signals or RxJS for state (keep it simple)

---

## 5. Musical Logic Constraints (Critical)

The agent **must not invent musical behavior**.

All music generation must:
- Use **numeric note representations (0–11)**
- Follow the pseudocode defined in `Haikupedias_V1_Dev_Guide.md`
- Be deterministic given the same inputs

Forbidden:
- Improvisation
- Random harmony outside specified rules
- Advanced theory concepts (modes, scales, modulations)

---

## 6. Audio Constraints

- Use **Web Audio API only**
- Simple oscillators or basic samples
- Timing correctness > sound realism
- Audio scheduling must be explicit and readable

Do not introduce third-party audio frameworks.

---

## 7. Coding Style Expectations

- TypeScript `strict: true`
- Prefer small, pure functions
- Explicit naming over cleverness
- Comments are encouraged for musical steps

Avoid:
- Metaprogramming
- Dynamic evaluation
- Hidden side effects

---

## 8. Naming Conventions

Prefer **domain-neutral names** to allow future expansion:

Good:
- `CompositionRules`
- `Universe`
- `generateComposition()`

Avoid:
- Hardcoding `haiku` inside music libraries
- Author-specific naming in shared logic

---

## 9. What NOT to Do

- Do not introduce Module Federation
- Do not configure Webpack manually
- Do not add SSR or Express
- Do not add authentication, persistence, or networking

If unsure, choose the **simplest possible implementation**.

---

## 10. Development Workflow

Use Nx commands:

```bash
nx serve haikupedias-shell
nx build haikupedias-shell
nx test haikupedias-shell
```

Libraries should be tested independently where practical.

---

## 11. Decision Hierarchy (When in Doubt)

1. Follow project briefs (`Haikupedias_V1_Project_Brief.md`)
2. Follow musical pseudocode (`Haikupedias_V1_Dev_Guide.md`)
3. Prefer clarity over abstraction
4. Ask for human input rather than guessing

---

## 12. Final Reminder

This project is closer to a **digital instrument** than a web app.

Write code that is:
- Calm
- Predictable
- Respectful of constraints

*End of Copilot instructions.*

