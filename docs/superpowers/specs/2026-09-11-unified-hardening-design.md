# Unified DOH-NUT Hardening Design

**Date:** 2026-09-11
**Status:** Approved design; implementation pending user review
**Scope:** Unified implementation of the verified `improvement.md` findings and the complementary full-stack audit findings.

## Goals and guardrails

This release addresses the verified customer-facing UI/accessibility defects, payment recovery gap, state/error handling defects, deployment reliability issues, catalog integrity drift, availability risk, cold-start test gap, and confirmed dependency hygiene issues.

The existing DOH-NUT visual identity, Home -> category slider transition, 3D donut experience, session scoping, stock limits, payment verification, and admin protection remain unchanged. Changes are surgical. No new navigation surfaces, category bars, redesigns, or unrequested UI structures are permitted.

All existing tracked and untracked worktree changes are preserved. Agents must avoid reverting or rewriting unrelated work.

## Delegation and ownership

Implementation is divided into disjoint tracks. Agents may research adjacent code but may edit only files assigned to their track:

### Track A: Customer interaction and accessibility

- Resolve missing mascot references using an approved local asset or a safe existing fallback.
- Convert checkout controls to a semantic form with native constraints, field-level errors, `aria-invalid`, `aria-describedby`, an accessible summary, and first-invalid-field focus.
- Remove nested interactive semantics from product cards while preserving the current visual card and actions.
- Clamp detail quantity to stock, disable the increment control at the ceiling, and retain a final add-to-cart stock check.
- Add reduced-motion behavior, correct header observation of the real scroll container, and an accessible splash bypass.
- Migrate shopping-flow raw images to `next/image` only where sizing and local-asset guarantees are established.

### Track B: Store, checkout, and recovery

- Debounce search by roughly 250–400ms and prevent stale responses from replacing newer results.
- Preserve existing cart/favorite data on load failure and expose explicit error state plus retry actions through existing surfaces.
- Add payment retry recovery for the already-created order after gateway-start failure. Retry must reuse the existing order and payment-create endpoint; it must not recreate orders or perform client-side payment marking.

### Track C: Deployment and data reliability

- Guard standalone asset copying so missing build directories or assets produce an explicit, actionable failure rather than a silent malformed release.
- Reconcile the catalog count and affected documentation, and add a catalog-count contract test.
- Drive the tracking WebSocket URL from environment configuration with a safe development default.
- Audit the second Prisma client and remove or consolidate it only after confirming all imports and runtime assumptions.
- Add or adjust Vercel configuration only where the current deployment contract requires it; do not introduce speculative settings.

### Track D: API availability, tests, and hygiene

- Correct anonymous rate-limit identity behavior without weakening per-session or per-IP protection.
- Add focused `ensure-ready` coverage for schema creation, legacy migration, seed idempotency, and retry behavior.
- Remove dependencies only after proving they are unused in source, configuration, and build paths; update the lockfile through the package manager.
- Update directly affected documentation and audit artifacts without overwriting user-authored changes.

## Coordination model

Research may be parallelized, but edits are sequentially handed off by track because checkout/store behavior and shared configuration have cross-track coupling. Each agent reports changed files, assumptions, and targeted validation. A coordinator performs the integration pass, resolves legitimate conflicts without discarding existing worktree changes, and checks that no agent crossed ownership boundaries.

## Behavioral design

### Payment recovery

The current order-first flow remains authoritative. When payment creation fails after order creation, the client retains the order identifier and displays a retry action. Retry calls the existing payment-create route with the same order identifier and session header. Success follows the existing allowed-redirect and tracking paths; a repeated-payment response follows the existing already-paid path. Gateway failure remains visibly unsuccessful.

### Remote collection failures

Cart and favorites load failures no longer replace collections with `[]`. The store retains the last known value, records an error, and provides a retry action. Empty state is shown only for a successful empty response.

### Search concurrency

Search input updates remain immediate locally, but network loading is delayed and sequenced. A request can update the catalog only if it is still the latest request for the current filter/search/sort state. Non-search filter and sort behavior remains intact.

### Accessibility and visual behavior

The existing visual composition is preserved. Semantic controls, labels, error associations, focus recovery, reduced-motion handling, and scroll-container observation are added without introducing new navigation or redesigning the storefront.

## Testing and release gates

Add or update focused tests for:

- catalog count and image-reference contract;
- `ensure-ready` schema/migration/seed idempotency;
- rate-limit identity behavior;
- store stale-search protection and cart/favorites error preservation;
- stock ceiling behavior;
- payment retry reuse of an existing order.

Run the repository's existing `bun test`, `bun run lint`, and `bun run build` commands after integration. Investigate and fix failures caused by these changes; do not broaden scope to unrelated pre-existing failures.

## Explicit non-goals

- No payment-provider replacement or webhook semantic changes.
- No backend authorization weakening.
- No new category navigation, tab bars, or visual surfaces.
- No speculative infrastructure migration.
- No dependency removal based solely on bundle-size intuition.
