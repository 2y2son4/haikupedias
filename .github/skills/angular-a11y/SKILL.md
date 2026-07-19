---
name: angular-a11y
description: >
  Enforce Angular accessibility implementation standards for this Nx monorepo.
  Use for building or refactoring accessible Angular components, templates, forms,
  dialogs, and navigation with WCAG 2.2 AA baseline.
argument-hint: 'Component, page, or feature to implement or review for a11y'
---

# Angular A11y Implementation Skill (Haikupedias)

Apply this skill when writing or modifying Angular UI code.

## Objectives

- Produce accessible Angular templates and component behavior by default.
- Enforce WCAG 2.2 AA baseline requirements during implementation.
- Keep changes aligned with Nx and project conventions.

## Mandatory Rules

- Prefer semantic HTML before ARIA (`button`, `nav`, `main`, `form`, `label`, heading order).
- Add ARIA only when native semantics cannot represent the interaction.
- Ensure every interactive element has an accessible name.
- Support full keyboard operation (tab order, Enter/Space, Escape where applicable).
- Keep visible focus indicators and predictable focus movement.
- Associate form labels, hints, and errors programmatically.
- Use `aria-live`/status patterns for async updates that must be announced.
- Do not rely on color alone to convey state.
- Preserve reduced-motion behavior for animations and transitions.

## Angular-Specific Guidance

- Prefer Angular CDK helpers for focus and keyboard management when complexity grows.
- For dialogs/overlays: trap focus, restore focus to trigger on close, and expose labels.
- For custom controls: maintain role/state parity and keyboard parity with native controls.
- Keep templates readable so accessibility relationships are obvious in code review.

## Required A11y Pass (for every UI change)

Before finishing a response, run this checklist and include results:

1. Name/Role: all controls expose clear accessible names and correct semantics.
2. Keyboard: every action is operable without mouse.
3. Focus: focus is visible and moves logically after interactions.
4. Forms/Errors: labels and validation feedback are programmatically connected.
5. Contrast/State: text and controls meet WCAG AA contrast and non-color-only signaling.

## Output Contract

When asked to implement/refactor, return:

- Code changes.
- A short "A11y pass" summary with pass/fail per checklist item.
- Any residual risks or manual test recommendations (keyboard/screen reader).
