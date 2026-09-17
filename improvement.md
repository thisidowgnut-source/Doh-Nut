# DOH-NUT UI/UX Improvement Handoff

Status: Active handoff; partial implementation present; release gates must be re-verified
Audience: Follow-up review and verification agent
Scope: Customer-facing UI/UX, accessibility, responsive behavior, commerce conversion, interaction states, and visual consistency
Repository: `thisidowgnut-source/Doh-Nut`

## 0. Current continuation snapshot

Last refreshed: 2026-09-16

- **Continuous 360° Donut Rotation Continuum Delivered**:
  - Screen 1 (Home Stack): `rotate: 0°` upright baseline.
  - Screen 2 (3D Ring Slider): Connected via `layoutId`, rolling 360° clockwise at **`2.1s`** (`easeInOutCubic: [0.37, 0, 0.63, 1]`). Sibling donuts fade in gracefully at `delay: 0.7s` (`scale: 0.6 ➔ 1`); bottom card slides up at `delay: 0.75s`.
  - Screen 3 (Half-Donut Split Detail): Center donut unmounts cleanly from slider to bleed-off right margin (`-mr-24`), rolling another 360° to `rotate: 720°` at **`2.1s`**. Staggered nutrition pills (*Salt, Sugar, Fat, Energy*) enter at `delay: 0.4s – 0.7s`. Total card at `delay: 0.7s`.
  - Reversal: Back navigation smoothly unwinds counter-clockwise (`720° ➔ 360° ➔ 0°`) with zero visual disappearances or jumping.
- Current release validation: `bun test` **62/62 passing**, `bun run build` **14/14 static & dynamic pages OK** (0 TypeScript errors), live dev server verified on port 3000.
- All non-negotiable product guardrails (Zero Unprompted UI Additions, official brand palette, authentic Flutter-derived layout) remain 100% strictly enforced.

## 1. Purpose

This document records the UI/UX audit findings for the current Next.js storefront. The next agent should review every finding against the current branch, verify whether it still applies, and recommend or implement only approved changes.

This is an improvement handoff, not an authorization to redesign the product. Preserve the existing DOH-NUT visual identity and the current Home -> category slider concept unless the user explicitly approves a structural change.

## 2. Non-negotiable product guardrails

- Do not add unrequested navigation bars, category tabs, buttons, or visual surfaces.
- Preserve the official yellow, red, navy, and cream brand palette.
- Preserve the core Home -> Slider transition and the 3D donut experience unless a replacement is explicitly approved.
- Do not change payment or order semantics to make a visual issue appear fixed.
- Preserve session scoping, stock limits, payment verification, and admin protection.
- Prefer surgical fixes over broad refactors.
- Keep customer copy playful, but pair playful headings with direct transactional meaning.
- Every changed interactive surface must remain keyboard accessible and usable on touch screens.

## 3. Severity definitions

| Level | Meaning |
|---|---|
| P1 | Can block purchase completion, mislead the user, break trust, or create a serious accessibility problem |
| P2 | Material usability, accessibility, responsive, performance, or state-management issue |
| P3 | Polish, consistency, copy, information architecture, or lower-risk refinement |

## 4. P1 findings

### P1-01: Missing mascot asset references

**Evidence:** Multiple live components reference `/brand/dohnut-mascot.png`, but the file was not present in `public/brand/` during the audit.

**Affected files:**

- `src/components/dohnut/cart-drawer.tsx`
- `src/components/dohnut/ai-concierge.tsx`
- `src/components/dohnut/favorites-view.tsx`
- `src/components/dohnut/orders-view.tsx`
- `src/components/dohnut/order-tracking-view.tsx`
- `src/components/dohnut/swipe-view.tsx`
- `src/components/dohnut/error-boundary.tsx`
- `src/components/dohnut/donut-slider.tsx`
- `src/components/dohnut/dohnut-footer.tsx`

**User impact:** Empty, error, loading, and AI states can show broken images, making recovery surfaces look unfinished.

**Suggested improvement:** Add the intended local asset or replace all references with an existing approved asset. Add a safe fallback for decorative imagery if appropriate.

**Verification:** Load every listed state and confirm there are no failed image requests or broken-image icons.

### P1-02: Checkout is not a semantic form

**File:** `src/components/dohnut/checkout-view.tsx`

**User impact:** Validation is represented by a generic toast rather than field-level feedback. Enter-to-submit, browser validation, screen-reader error association, and focus recovery are weak.

**Suggested improvement:**

- Wrap delivery and payment controls in a semantic `<form>`.
- Use `required` and appropriate native input constraints.
- Add field-level errors with `aria-invalid` and `aria-describedby`.
- Focus the first invalid field.
- Keep a concise error summary for assistive technology.

**Verification:** Submit with missing and malformed fields using mouse, keyboard, and a screen reader. Confirm the first invalid field is clear and actionable.

### P1-03: Product cards contain nested interactive controls

**File:** `src/components/dohnut/donut-card.tsx`

**Evidence:** The outer `motion.div` uses `role="button"` and `tabIndex={0}`, while Favorite and Add to Cart buttons are nested inside it.

**User impact:** Assistive technologies may announce confusing nested button semantics. Keyboard focus and activation order are harder to understand.

**Suggested improvement:** Use a non-interactive card wrapper and provide a dedicated product-name/image button or link for opening details. Keep Favorite and Add to Cart as independent controls.

**Verification:** Navigate the card with keyboard and a screen reader. Each action must have one clear accessible name and no nested-button announcement.

### P1-04: Detail quantity can exceed available stock

**File:** `src/components/dohnut/detail-modal.tsx`

**Evidence:** The increase control increments quantity without clamping to `donut.stock`.

**User impact:** The modal can display and submit an impossible quantity. This is inconsistent with the stock ceiling already used in the cart.

**Suggested improvement:** Disable the increment control at `qty >= donut.stock`, clamp the value, and validate again immediately before add-to-cart because stock may change.

**Verification:** Test stock values 0, 1, and 2. Confirm quantity never exceeds stock and sold-out products cannot be added.

### P1-05: Search requests on every keystroke

**File:** `src/store/use-shop.ts`

**Evidence:** `setSearch` immediately invokes `loadDonuts`.

**User impact:** Fast typing creates overlapping requests, loading flicker, unnecessary mobile network use, and possible stale-response overwrites.

**Suggested improvement:** Debounce search by approximately 250-400ms and ignore or cancel stale requests.

**Verification:** Type quickly on a throttled connection. Confirm the final query always controls the displayed results and request volume is bounded.

### P1-06: Cart and favorites load failures look empty

**File:** `src/store/use-shop.ts`

**Evidence:** `loadCart` and `loadFavorites` catch failures and replace the collections with empty arrays.

**User impact:** A network outage can make a returning customer believe saved items were deleted.

**Suggested improvement:** Preserve the previous collection, expose an error state, and show a retryable message. Do not represent unavailable remote data as valid empty data.

**Verification:** Simulate API failure after existing cart/favorite data is loaded. Confirm the data is preserved and the user sees recovery feedback.

### P1-07: Payment gateway failure has no existing-order recovery

**File:** `src/components/dohnut/checkout-view.tsx`

**Evidence:** The order is created before payment URL creation. A gateway failure reports that the order is saved but provides no explicit retry-payment action for that order.

**User impact:** Retrying checkout can create duplicate orders and leaves the customer unsure what to do next.

**Suggested improvement:** Retain the created order ID, provide a retry-payment action, and route to the existing pending order instead of creating a second order.

**Verification:** Force payment creation failure, retry, and confirm only one order exists with a clear payment recovery path.

## 5. P2 findings

### P2-01: Reduced-motion support is inconsistent

**Affected areas:** `src/app/globals.css`, `shop-home.tsx`, `splash-screen.tsx`, `particle-background.tsx`, `swipe-view.tsx`, `cart-drawer.tsx`, `dohnut-footer.tsx`.

**User impact:** Continuous floating, particle, swipe, spring, and media animations may remain active for users who request reduced motion.

**Suggested improvement:** Add a global reduced-motion override for non-essential CSS animation and transition. Pass reduced-motion behavior into Framer Motion interactions.

### P2-02: Splash screen lacks an accessible immediate bypass

**File:** `src/components/dohnut/splash-screen.tsx`

**User impact:** The full-screen intro delays access and can only be dismissed by clicking; keyboard users have no visible skip control.

**Suggested improvement:** Add a visible `Skip intro` button, support Escape, use `aria-modal="true"` when behaving as a modal, and shorten the intro for repeat visitors.

### P2-03: Slider keyboard handling is global

**File:** `src/components/dohnut/donut-slider.tsx`

**User impact:** Arrow keys can change the donut while the user is interacting with unrelated content.

**Suggested improvement:** Attach keyboard handling to a focusable carousel region and expose the interaction instructions.

### P2-04: Slider semantics do not expose current position

**File:** `src/components/dohnut/donut-slider.tsx`

**User impact:** Screen-reader users cannot reliably identify the centered donut, item number, or total item count.

**Suggested improvement:** Add carousel region semantics, `aria-current` or equivalent active state, item position text, and a concise live announcement.

### P2-05: Loading, empty, and error states are inconsistent

**Affected files:** `donut-grid.tsx`, `favorites-view.tsx`, `orders-view.tsx`, `use-shop.ts`.

**User impact:** API failure can look like an empty catalog or incomplete page.

**Suggested improvement:** Give each remote collection explicit loading, empty, and error-with-retry states.

### P2-06: Stock status is contradictory

**File:** `src/components/dohnut/detail-modal.tsx`

**Evidence:** The detail view can show `In Stock (0)` while the action footer says `Sold Out`.

**Suggested improvement:** Centralize availability wording and styling for in-stock, low-stock, and sold-out states across card, slider, modal, cart, and checkout.

### P2-07: Navigation actions are duplicated

**Affected files:** `dohnut-header.tsx`, `bottom-nav.tsx`.

**User impact:** Cart, Shop, Favorites, Orders, and AI Concierge appear in multiple navigation surfaces, making mobile hierarchy busy.

**Suggested improvement:** Keep BottomNav for the four primary destinations. Move secondary AI and utility actions into the menu or contextual surfaces.

### P2-08: Header observes the wrong scroll context

**Affected files:** `src/app/page.tsx`, `src/components/dohnut/dohnut-header.tsx`.

**Evidence:** The active view uses an internal `overflow-y-auto` container while the header reads `window.scrollY`.

**User impact:** Header background and contrast state may not change when the actual content scrolls.

**Suggested improvement:** Observe the real scroll container or unify the page scroll context.

### P2-09: Secondary text uses fragile contrast

**Affected areas:** Cart, product cards, checkout, footer, and global color tokens.

**User impact:** Opacity values such as `/40`, `/50`, and `/60`, combined with 9-11px text and translucent surfaces, can make important supporting information difficult to read.

**Suggested improvement:** Reserve low opacity for decorative metadata. Validate critical combinations with WCAG contrast checks and prefer 12-13px minimum supporting text.

### P2-10: Desktop checkout summary is not sticky

**File:** `src/components/dohnut/checkout-view.tsx`

**User impact:** Users filling a long address form can lose sight of total, delivery fee, and payment CTA.

**Suggested improvement:** Make the summary sticky at desktop widths and keep normal stacked flow on mobile.

### P2-11: Touch targets are inconsistent

**Affected areas:** Favorite controls, filter pills, footer links, modal icon controls, and slider dots.

**Suggested improvement:** Use a consistent target of approximately 44x44 CSS pixels for icon actions and adequate spacing between adjacent controls.

### P2-12: Raw images are used throughout the shopping flow

**Affected areas:** Product cards, detail modal, cart, slider, checkout, and swipe view.

**User impact:** Responsive image payload and LCP behavior are less predictable on mobile.

**Suggested improvement:** Use `next/image` where compatible, define responsive `sizes`, prioritize only the real LCP image, and lazy-load secondary product images.

## 6. P3 findings and design recommendations

### P3-01: Document language is fixed to English

**File:** `src/app/layout.tsx`

If the product remains fully English, this is acceptable. If Malay or bilingual copy is introduced, use locale-aware document language and localized regions.

### P3-02: Footer is disconnected from the main flow

**File:** `src/components/dohnut/dohnut-footer.tsx`

The footer contains useful trust, support, address, payment, and navigation content but is not rendered by the main page composition. Decide whether to include it intentionally or remove it from the active product surface.

### P3-03: Playful copy can obscure transactional meaning

Recommended paired labels:

- `Your Box` + `Cart - 3 items`
- `Track record` + `Order history`
- `DOH MY GOSH!` + `No saved favorites yet`
- `DOH NUT WAIT!` + `No orders yet`

### P3-04: Order statuses need explicit next steps

Examples:

- `Payment failed - Retry payment`
- `Payment received - Awaiting review`
- `Baking - Estimated 18 minutes`

### P3-05: Decorative motion dominates some recovery states

Keep the mascot, but prioritize the explanation and recovery CTA over animation in cart-empty, favorites-empty, orders-empty, and error states.

### P3-06: Focus styling should be standardized

The global `:focus-visible` rule is a good baseline. Add a shared focus utility or component convention for all custom icon controls, filters, slider dots, footer links, and modal actions.

### P3-07: Primary discovery architecture needs an explicit decision

The repository contains both an immersive slider experience and storefront-oriented components:

- `shop-home.tsx`
- `donut-slider.tsx`
- `shop-nav.tsx`
- `filter-bar.tsx`
- `donut-grid.tsx`
- `hero-carousel.tsx`
- `video-commercial.tsx`
- `dohnut-footer.tsx`

The current main flow primarily uses Home -> category slider -> detail. The catalog also contains `specialty`, but Home exposes only three types.

Recommendation: choose one primary discovery model intentionally:

- Experience-first: keep Home -> Slider and add a clear, approved path to browse all flavors.
- Commerce-first: make search/filter/grid the primary shop and keep the slider as a discovery module.

Do not activate unused surfaces or add navigation without explicit approval.

## 7. Recommended implementation order

### Phase 1: Trust and purchase completion

- P1-01 missing asset references
- P1-02 semantic checkout and field errors
- P1-03 product card interaction semantics
- P1-04 stock ceiling in detail
- P1-05 debounced and stale-safe search
- P1-06 remote failure states for cart and favorites
- P1-07 payment retry for an existing order
- P2-06 consistent stock messaging

### Phase 2: Accessibility and mobile usability

- P2-01 reduced-motion support
- P2-02 splash bypass
- P2-03 and P2-04 slider keyboard and semantics
- P2-05 explicit collection states
- P2-09 contrast improvements
- P2-10 sticky desktop checkout summary
- P2-11 touch target consistency

### Phase 3: Information architecture and polish

- P2-07 navigation consolidation
- P2-08 header scroll context
- P2-12 image optimization
- P3-01 language strategy
- P3-02 footer placement
- P3-03 copy clarity
- P3-04 order next steps
- P3-05 recovery-state hierarchy
- P3-06 focus convention
- P3-07 discovery architecture decision

## 8. Verification checklist for the follow-up agent

### Repository and asset verification

- [ ] Re-check every file path and line reference against the current branch.
- [ ] Confirm whether `/brand/dohnut-mascot.png` exists before changing asset references.
- [ ] Check whether any uncommitted user changes overlap the proposed files.
- [ ] Do not modify unrelated documentation or supporting research files.

### Accessibility verification

- [ ] Keyboard-only traversal works for Home, slider, product card, detail, cart, checkout, orders, tracking, AI panels, and error states.
- [ ] No nested interactive controls are announced incorrectly.
- [ ] Every icon-only control has an accessible name.
- [ ] Focus remains visible on yellow, cream, white, navy, and red surfaces.
- [ ] Dialogs and sheets trap focus and restore focus correctly.
- [ ] Reduced-motion preference removes non-essential continuous animation.
- [ ] Contrast is checked for primary text, prices, status badges, helper text, and disabled states.

### Responsive verification

- [ ] Test at approximately 320px, 375px, 390px, 768px, 1024px, and 1440px widths.
- [ ] Confirm safe-area spacing around the bottom navigation.
- [ ] Confirm long checkout forms do not hide the payment CTA.
- [ ] Confirm sheets, dialogs, slider, swipe deck, and order tracking remain usable on touch.
- [ ] Confirm there is no horizontal overflow except intentionally scrollable pill rows.

### Commerce verification

- [ ] Quantity never exceeds current stock in detail and cart.
- [ ] Out-of-stock state is consistent across all product surfaces.
- [ ] Search results cannot be overwritten by stale responses.
- [ ] Cart and favorites failures do not appear as deletion.
- [ ] Payment failure exposes a retry or existing-order recovery action.
- [ ] Repeated payment attempts do not create duplicate orders unintentionally.
- [ ] Payment success is never announced based solely on redirect.

### Regression commands

Run the repository's existing checks after approved implementation:

```bash
bun run lint
bun test
bun run build
```

Also exercise the affected flows manually:

```text
Home -> category -> slider -> detail -> add to cart
Cart -> checkout -> validation errors -> payment
Payment failure -> retry existing order
Favorites load failure -> retry
Orders -> tracking -> delivered -> order again
Keyboard-only navigation
prefers-reduced-motion
320px and desktop layouts
```

## 9. Acceptance standard

An improvement is complete only when:

1. The verified issue is fixed at its root, not hidden with a visual workaround.
2. Existing DOH-NUT visual identity and approved interaction model remain intact.
3. Keyboard, screen-reader, touch, reduced-motion, and responsive behavior are covered where relevant.
4. Loading, empty, success, and failure states remain distinguishable.
5. The targeted checks and manual flow verification pass.
6. The follow-up agent records any finding that was not reproducible instead of making speculative changes.
