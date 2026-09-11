# Unified DOH-NUT Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved UI, checkout-recovery, state, deployment, data-integrity, availability, test-coverage, and dependency-hygiene fixes without changing DOH-NUT's visual or payment semantics.

**Architecture:** Four agents own disjoint tracks: customer interaction/accessibility, store/checkout recovery, deployment/data reliability, and API/testing/hygiene. Agents edit only their assigned files, commit self-contained changes, and hand off to an integration agent that resolves cross-track conflicts and runs the release gates.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Zustand, Prisma/SQLite, Bun test, ESLint, Tailwind CSS, socket.io-client.

**Spec:** `docs/superpowers/specs/2026-09-11-unified-hardening-design.md`

## Global Constraints

- Preserve the existing DOH-NUT visual identity, Home -> category slider transition, 3D donut experience, session scoping, stock limits, payment verification, and admin protection.
- Make surgical changes; do not add navigation surfaces, category bars, redesigns, or unrequested UI structures.
- Preserve all existing tracked and untracked worktree changes; never reset or discard unrelated edits.
- Payment recovery must reuse the existing order and payment-create route; never recreate the order or mark payment successful in the client.
- Empty collections are valid only after a successful empty response; failed cart/favorite loads retain prior data and expose retryable errors.
- Only remove a dependency after proving it is unused in source, configuration, and build paths.
- Run existing `bun test`, `bun run lint`, and `bun run build` after integration.

---

### Task 1: Implementing customer interaction and accessibility fixes

**Files:**
- Modify: `src/components/dohnut/checkout-view.tsx`
- Modify: `src/components/dohnut/donut-card.tsx`
- Modify: `src/components/dohnut/detail-modal.tsx`
- Modify: `src/components/dohnut/dohnut-header.tsx`
- Modify: `src/components/dohnut/splash-screen.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`
- Inspect and modify only as needed: `src/components/dohnut/checkout-view.tsx`, `cart-drawer.tsx`, `donut-card.tsx`, `donut-carousel-3d.tsx`, `donut-slider.tsx`, `favorites-view.tsx`, `hero-carousel.tsx`, `orders-view.tsx`, `order-tracking-view.tsx`, `shareable-card.tsx`, `swipe-view.tsx`, `video-commercial.tsx`, `ai-concierge.tsx`, `ai-designer.tsx`
- Create or modify: `public/brand/dohnut-mascot.png` only if an approved existing asset cannot be used as a fallback
- Test: focused accessibility/stock contract tests under `tests/` if the existing Bun test setup can exercise the behavior

**Interfaces:**
- Consumes: existing `Donut`, `CartItem`, `useShop`, and Button/Input/Label primitives.
- Produces: keyboard-safe product cards, bounded detail quantity, a semantic checkout form, reduced-motion CSS, scroll-aware header behavior, accessible splash bypass, and safe local image rendering.

- [ ] **Step 1: Write focused regression assertions for stock and card semantics.**

Use the repository's existing Bun test style. Assert that the quantity transition never exceeds `donut.stock`, that stock zero cannot produce an add-to-cart action, and that the card's detail target is the only card-level interactive element while favorite/add controls remain independent.

- [ ] **Step 2: Convert checkout controls to a semantic form without changing the existing layout.**

Wrap the current delivery/payment controls in `<form onSubmit={...}>`, call `event.preventDefault()`, add `required` and type/input constraints, maintain a field-error map keyed by the existing form keys, render each error with a stable `id`, connect it through `aria-describedby`, set `aria-invalid`, and focus the first invalid element via a ref map. Keep the current toast as a concise summary rather than the only validation channel.

- [ ] **Step 3: Remove the product card's outer button role.**

Keep the visual wrapper as a non-interactive `motion.div`. Give the existing product image/name region a dedicated button with an accessible name and preserve its detail-opening handler. Stop propagation only where necessary for favorite/add controls so each action has one focus target.

- [ ] **Step 4: Clamp detail quantity and add a final stock guard.**

Initialize quantity with `Math.min(1, donut.stock)` for positive stock, set the increment button `disabled={qty >= donut.stock}`, update the increment handler with `Math.min(donut.stock, q + 1)`, and reject add-to-cart when stock is zero or the requested quantity exceeds current stock. Preserve the existing sold-out copy and cart ceiling.

- [ ] **Step 5: Add reduced-motion and real-scroll-container behavior.**

Add a `prefers-reduced-motion: reduce` override in `src/app/globals.css` for transitions/animations that are not essential. Pass or locate the existing page scroll container ref from `src/app/page.tsx` and let `dohnut-header.tsx` observe that element rather than `window`, with cleanup on unmount and a safe fallback when the ref is not available.

- [ ] **Step 6: Add an accessible splash bypass and resolve mascot imagery.**

Provide a keyboard-focusable skip/dismiss control in the existing splash surface without adding a new navigation surface. Replace broken mascot references with an existing local approved asset or create the specifically requested mascot asset only when no existing asset satisfies the role; decorative images must have empty alt text.

- [ ] **Step 7: Migrate only safe shopping-flow raw images.**

For local product assets with known dimensions, use `next/image` with explicit `width`, `height`, `sizes`, and `priority` only for the existing LCP image. Leave generated/canvas-dependent or remote/unknown-dimension images unchanged. Do not add remote image domains or alter visual sizing.

- [ ] **Step 8: Run the focused validation and commit.**

Run `bun test` with the focused selectors available in the repository, then `bun run lint`. Commit only the assigned files:

```bash
git add -- src/components/dohnut/checkout-view.tsx src/components/dohnut/donut-card.tsx src/components/dohnut/detail-modal.tsx src/components/dohnut/dohnut-header.tsx src/components/dohnut/splash-screen.tsx src/app/page.tsx src/app/globals.css public/brand/dohnut-mascot.png tests/customer-accessibility.test.ts
git commit -m "fix: harden customer interaction accessibility"
```

Expected result: keyboard and screen-reader semantics are unambiguous, quantity never exceeds stock, reduced motion is honored, the header follows the actual scroll container, and no broken mascot requests remain.

---

### Task 2: Hardening store state and payment recovery

**Files:**
- Modify: `src/store/use-shop.ts`
- Modify: `src/components/dohnut/checkout-view.tsx` only for the payment-retry UI contract left by this task
- Modify: existing cart/favorites surfaces that render store errors (`src/components/dohnut/cart-drawer.tsx`, `src/components/dohnut/favorites-view.tsx`) 
- Test: `tests/catalog-error-state.contract.test.ts` or a new focused Bun test for store request sequencing

**Interfaces:**
- Consumes: existing `apiFetch`, `Order`, `CartItem`, `Favorite`, `getSessionId`, and current toast/surface components.
- Produces: `cartError` and `favoritesError` state, retryable `loadCart`/`loadFavorites`, latest-request-wins catalog loading, and an existing-order payment retry action.

- [ ] **Step 1: Add failing tests for lossy collection errors and stale search responses.**

Exercise the store actions with mocked `apiFetch`: load an initial cart/favorite collection, reject the next load, and assert the previous collection remains with a non-null error. Start two catalog requests and resolve the older one last; assert the newer request's result remains displayed.

- [ ] **Step 2: Add explicit collection error state without changing successful responses.**

Add `cartError: string | null` and `favoritesError: string | null` to `ShopState`, clear the corresponding error before each request, set the error in `catch`, and remove `set({ cart: [] })`/`set({ favorites: [] })` from failure paths. Keep `[]` only for a successful empty API result.

- [ ] **Step 3: Add retry actions to existing surfaces.**

Render a concise retryable error state in the existing cart/favorites surfaces only when the corresponding error is non-null. Use the existing Button/toast patterns and call `loadCart` or `loadFavorites`; do not introduce a new navigation element or replace the existing empty state for successful emptiness.

- [ ] **Step 4: Make catalog loading debounced and stale-safe.**

Track a monotonically increasing request sequence in the store closure or state. Debounce only search-triggered loads by approximately 300ms, clear the timer on replacement, and apply catalog data only when the response sequence matches the latest request. Filter and sort changes should continue to load immediately.

- [ ] **Step 5: Add existing-order payment retry state and action.**

Keep `failedPaymentOrderId` and the customer name/payment method needed by the existing flow in component state. Extract the current payment-create request into a helper that accepts an existing `orderId`; on gateway failure, render a retry action using that ID. The retry must send `x-session-id`, reuse `/api/payment/billplz/create`, and follow the existing allowed-URL, dev, 409, redirect, and tracking branches.

- [ ] **Step 6: Run focused tests and commit.**

Run the focused store/payment tests and lint the changed files. Commit:

```bash
git add src/store/use-shop.ts src/components/dohnut/checkout-view.tsx src/components/dohnut/cart-drawer.tsx src/components/dohnut/favorites-view.tsx tests
git commit -m "fix: preserve recovery state across commerce failures"
```

Expected result: remote failures cannot masquerade as empty data, search cannot be overwritten by stale responses, and gateway-start failure offers recovery for the same saved order.

---

### Task 3: Securing deployment, catalog integrity, and tracking configuration

**Files:**
- Modify: `package.json`
- Modify: `next.config.ts` only if required by verified deployment behavior
- Modify: `src/components/dohnut/order-tracking-view.tsx`
- Modify: `src/lib/db-production-architecture.ts` only after import/runtime audit
- Modify: catalog/documentation files whose count is actually incorrect
- Create: a focused catalog contract test under `tests/`
- Modify: `tests/database-runtime-build.sh` if the build-copy guard belongs there
- Create or modify: `vercel.json` only if a current deployment command or platform contract proves it is needed
- Modify: `.env.example` for the tracking URL variable if the file exists and is the project convention

**Interfaces:**
- Consumes: `SEED_DONUTS`, current standalone build script, `db.ts`, `db-production-architecture.ts`, and the order-tracking service contract.
- Produces: explicit build-copy failures, a verified catalog-count contract, environment-driven tracking URL, and one coherent Prisma client path.

- [ ] **Step 1: Write the failing catalog contract test.**

Assert that `SEED_DONUTS.length` equals the documented catalog count, every `imgUrl` resolves to a file under `public`, and names are unique. Use the actual current count as the source of truth only after inspecting `src/lib/seed-data.ts`; update incorrect docs to that verified count rather than hard-coding an assumed number.

- [ ] **Step 2: Guard the standalone asset-copy release command.**

Replace the inline `node -e` in the `build` script with a small checked command or script that verifies `.next/standalone`, `.next/static`, and `public` exist before copying, uses explicit error messages, and exits nonzero on missing paths. Keep the successful copy behavior unchanged.

- [ ] **Step 3: Make tracking URL configuration explicit.**

Add a named environment variable such as `NEXT_PUBLIC_TRACKING_URL` to the existing configuration convention, use it in `order-tracking-view.tsx`, and preserve the current local transform-port fallback only for development. Do not change the mini-service protocol or tracking fallback polling.

- [ ] **Step 4: Audit and consolidate Prisma clients.**

Trace every import of `db-production-architecture.ts` and `db.ts`. If the second client is unused or duplicates the canonical client, remove only the duplicate export/import path and update tests. If it performs required production configuration validation, retain that validation as a helper without constructing a second client.

- [ ] **Step 5: Reconcile documentation and deployment configuration.**

Update only documents that claim an incorrect catalog count or reference a configuration proven missing by the current deploy path. Do not create speculative Vercel settings. Preserve all user-authored audit and brand documents.

- [ ] **Step 6: Run contract/build checks and commit.**

Run the catalog contract test and the existing database runtime/build script. Commit only verified changes:

```bash
git add -- package.json bun.lock src/components/dohnut/order-tracking-view.tsx src/lib/db-production-architecture.ts tests/catalog-contract.test.ts README.md AGENTS.md GEMINI.md
git commit -m "fix: harden deployment and catalog contracts"
```

Expected result: malformed standalone output fails loudly, catalog references and documentation agree, tracking is configurable, and no duplicate Prisma runtime is constructed.

---

### Task 4: Hardening API availability, cold-start coverage, and dependency hygiene

**Files:**
- Modify: `src/lib/rate-limit.ts`
- Modify: `src/lib/ensure-ready.ts` only for test seams or directly tested retry behavior
- Create: `tests/rate-limit.test.ts`
- Create: `tests/ensure-ready.test.ts`
- Modify: `package.json` and `bun.lock` only for confirmed unused dependencies
- Modify: directly affected imports/components when a dependency is removed

**Interfaces:**
- Consumes: existing `clientKeyFrom`, `rateLimit`, `ensureReady`, Prisma `db`, and `SEED_DONUTS`.
- Produces: non-colliding anonymous rate-limit keys, deterministic cold-start test seams, and a dependency manifest containing only confirmed runtime/build dependencies.

- [ ] **Step 1: Write rate-limit identity tests.**

Assert that explicit session IDs map to stable session keys, forwarded IPs map to stable IP keys, and requests lacking both do not all share one global anonymous bucket. The anonymous fallback must remain bounded and must not expose raw identifying data.

- [ ] **Step 2: Implement safe anonymous identity bucketing.**

Use a request-scoped/generated anonymous token when available through the existing session mechanism, otherwise derive a bounded non-global fallback that does not make all users share one bucket. Preserve the existing per-session and per-IP precedence and fixed-window behavior.

- [ ] **Step 3: Add cold-start schema and seed tests.**

Mock or isolate the database boundary used by `ensure-ready` and assert DDL execution is idempotent, legacy columns are added once, an empty catalog seeds exactly once, a populated catalog is not reseeded, and a failed initialization resets the cached promise so a later call can retry.

- [ ] **Step 4: Audit dependency usage before removal.**

Search source, config, tests, and build scripts for each suspected unused dependency (`@tanstack/react-table`, `react-day-picker`, `@mdxeditor/editor`, and any others). Remove only dependencies with zero valid references, then run the package manager to update `bun.lock`; retain packages used by transitive/runtime paths.

- [ ] **Step 5: Run focused tests and commit.**

Run the new rate-limit and ensure-ready tests plus the existing database tests. Commit:

```bash
git add src/lib/rate-limit.ts src/lib/ensure-ready.ts tests package.json bun.lock src
git commit -m "test: cover availability and cold-start safeguards"
```

Expected result: anonymous abuse cannot globally lock out all users, cold-start initialization is regression-tested, and dependency cleanup is evidence-based.

---

### Task 5: Integrating tracks and running release gates

**Files:**
- Modify: only files with legitimate cross-track conflicts identified during integration.
- Test: all existing repository tests and build/lint commands.

**Interfaces:**
- Consumes: commits from Tasks 1–4 and the approved design spec.
- Produces: one coherent working tree with no ownership violations, passing targeted tests, lint, and production build.

- [ ] **Step 1: Inspect each track commit and worktree status.**

Confirm that unrelated pre-existing changes remain intact and that each commit touched only its assigned scope. Do not use reset, checkout, or broad cleanup commands.

- [ ] **Step 2: Resolve shared-file conflicts surgically.**

Where checkout, `use-shop.ts`, `package.json`, or tests overlap, preserve both approved behaviors, remove duplicate logic, and keep public interfaces type-safe. Do not redesign the UI or change payment semantics.

- [ ] **Step 3: Run the targeted regression tests.**

Run the focused test selectors for stock, store errors/search, payment recovery, catalog integrity, rate limiting, and ensure-ready. Fix only failures caused by these changes.

- [ ] **Step 4: Run repository release gates.**

Run:

```bash
bun test
bun run lint
bun run build
```

Record any pre-existing failure separately from regressions introduced by the tracks.

- [ ] **Step 5: Commit integration corrections.**

```bash
git diff --name-only
git add -u -- src/store/use-shop.ts src/components/dohnut/checkout-view.tsx package.json tests
git commit -m "chore: integrate unified hardening tracks"
```

Expected result: all approved tracks are integrated, existing worktree changes are preserved, and the repository passes its established validation gates.
