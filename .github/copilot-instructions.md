# Copilot Instructions — Haikupedias (V1)

> **Audience**: AI coding agents (e.g. GitHub Copilot) working inside an IDE.
> **Goal**: Help the agent produce _correct, restrained, domain-aware code_ for an artistic system.

This file is the canonical instruction source for this repository.

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

Future versions _may_ introduce multiple universes and MFEs, but **do not anticipate them in code**.

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
    composition-engine/    # Gymnopedie-inspired rules
    audio/                 # Web Audio API helpers

  ui/
    components/            # Reusable presentational components
```

### Boundary Rules

- UI libraries **must not** contain music logic.
- Music libraries **must not** import Angular.
- Poetry libraries **must not** depend on music libraries.
- Respect Nx library boundaries and tags.
- Keep UI libraries presentational; put stateful/domain orchestration in feature or data-access layers.
- Use path aliases from `tsconfig.base.json`; avoid deep relative cross-project imports.
- Prefer Nx generators for scaffolding when generators exist.

---

## 4. Angular Conventions

- Use **standalone components/directives/pipes** by default.
- Do not introduce `@NgModule` for new code.
- Bootstrap via `bootstrapApplication()` and configure via `ApplicationConfig`.
- Prefer **Signals** for local and feature state: `signal`, `computed`, `effect`.
- Use RxJS when stream semantics are truly required (events, async composition, cancellation).
- Keep component state minimal and colocated.

### Accessibility Requirements (WCAG 2.2 AA)

- Treat accessibility as a release requirement, not an enhancement.
- Prefer semantic HTML (`main`, `nav`, `button`, `label`, `form`, heading order).
- Add ARIA only when native semantics are insufficient.
- Every interactive control must have an accessible name (`aria-label`, `aria-labelledby`, or visible text).
- Ensure full keyboard operation: tab order, visible focus, and Enter/Space behavior.
- Use `aria-live` and status messaging for async updates that need announcements.
- Ensure form controls have explicit labels and programmatic error associations.
- Do not use color as the only signal.
- Preserve reduced motion preferences and avoid inaccessible autoplay behavior.

When generating Angular UI code:

- Include a short accessibility pass for every component change: name, role, keyboard, focus, contrast.
- Prefer CDK helpers for focus and keyboard interactions when needed.

---

## 5. Musical Logic Constraints (Critical)

The agent **must not invent musical behavior**.

All music generation must:

- Use **numeric note representations (0-11)**.
- Follow the pseudocode defined in `Haikupedias_V1_Dev_Guide.md`.
- Be deterministic given the same inputs.

Forbidden:

- Improvisation.
- Random harmony outside specified rules.
- Advanced theory concepts (modes, scales, modulations).

---

## 6. Audio Constraints

- Use **Web Audio API only**.
- Simple oscillators or basic samples.
- Timing correctness over sound realism.
- Audio scheduling must be explicit and readable.

Do not introduce third-party audio frameworks.

---

## 7. Coding Style and Quality

- TypeScript strict mode is expected.
- Do not introduce `any` unless explicitly justified.
- Prefer small, pure functions and explicit naming.
- Avoid metaprogramming, dynamic evaluation, and hidden side effects.
- Add or update tests for behavior changes.

For larger changes, validate with relevant Nx commands:

```bash
nx lint <project>
nx test <project>
nx affected -t lint,test,build
```

---

## 8. Naming Conventions

Prefer domain-neutral names to allow future expansion.

Good examples:

- `CompositionRules`
- `Universe`
- `generateComposition()`

Avoid:

- Hardcoding `haiku` inside music libraries.
- Author-specific naming in shared logic.

---

## 9. What Not to Do

- Do not introduce Module Federation.
- Do not configure Webpack manually.
- Do not add SSR or Express.
- Do not add authentication, persistence, or networking.

If unsure, choose the simplest possible implementation.

---

## 10. Development Workflow

Primary app commands:

```bash
nx serve haikupedias-shell
nx build haikupedias-shell
nx test haikupedias-shell
nx lint haikupedias-shell
```

Libraries should be tested independently when practical.

---

## 11. Decision Hierarchy (When in Doubt)

1. Follow project briefs (`Haikupedias_V1_Project_Brief.md`).
2. Follow musical pseudocode (`Haikupedias_V1_Dev_Guide.md`).
3. Prefer clarity over abstraction.
4. Ask for human input rather than guessing.

---

## 12. Final Reminder

This project is closer to a digital instrument than a typical web app.

Write code that is:

- Calm
- Predictable
- Respectful of constraints

_End of Copilot instructions._
