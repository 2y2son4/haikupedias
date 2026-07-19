---
applyTo: 'apps/haikupedias-shell/**/*.{ts,html,scss},libs/ui/**/*.{ts,html,scss}'
---

# Angular + Nx Implementation Rules (Scoped)

For files in Angular app and UI libraries:

- Generate standalone Angular code by default.
- Prefer Signals (signal/computed/effect) for component and feature state.
- Keep imports through workspace path aliases; avoid deep relative cross-project imports.
- Respect Nx boundaries:
  - UI code stays presentational.
  - Feature/data logic stays outside pure UI components.
- Keep strict typing, avoid any, and model state with explicit interfaces/types.
- Include accessibility by default:
  - semantic elements first
  - accessible names for controls
  - keyboard support and visible focus
  - ARIA only when native semantics are insufficient
