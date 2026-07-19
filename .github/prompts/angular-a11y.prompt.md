---
mode: agent
description: Implement or review Angular UI changes with WCAG 2.2 AA accessibility guardrails.
---

Use the workspace skill `angular-a11y` and apply it strictly to this task.

Task input:

- Target: ${input:Target component/page/feature}
- Goal: ${input:What should be implemented or improved?}

Requirements:

- Follow Angular standalone patterns and Nx conventions in this workspace.
- Enforce semantic HTML, accessible names, keyboard support, focus management, and proper form/error associations.
- Use ARIA only when native semantics are insufficient.
- Include an explicit "A11y pass" checklist in the final response:
  1. Name/Role
  2. Keyboard
  3. Focus
  4. Forms/Errors
  5. Contrast/State

If code edits are needed, make them and explain what changed.
If reviewing only, provide findings ordered by severity with concrete fixes.
