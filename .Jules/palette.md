## 2025-06-18 - Missing ARIA Labels on Icon-only Navigation
**Learning:** Found a recurring pattern in modal/overlay components where icon-only buttons (like Close, Previous, Next) lack explicit accessible names. This breaks the experience for screen reader users relying on these navigation controls.
**Action:** Always verify icon-only buttons (`<button><Icon /></button>`) have an `aria-label` attribute describing their function when reviewing or building UI components.
