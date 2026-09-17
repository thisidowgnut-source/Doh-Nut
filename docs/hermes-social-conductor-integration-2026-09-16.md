---
title: "Doh-Nut: Hermes Conductor and Hermes-WebApp Integration"
document_id: "DOHNUT-HERMES-SOCIAL-CONDUCTOR-20260916"
status: "Proposal grounded in source inspection"
date: "2026-09-16"
scope: "Doh-Nut first; reusable project configuration later"
---

# Hermes Conductor + WebApp + Doh-Nut

## User direction

Hermes should operate as a conductor for real work, including social media automation. The first project is `G:/Doh-Nut`. The user is actively developing `C:/Users/megat/Hermes-WebApp` to make Hermes easier to operate. This document connects those two projects to the installed Hermes runtime.

This is an evidence-based integration proposal. Application code, agents, credentials, scheduled jobs, storefront UI, and publishing state were not changed. No post, comment, message, or promotion was published during inspection.

## Verified findings

| Finding | Evidence | Operational impact |
| --- | --- | --- |
| Local social module is a validator/preview/simulator | `G:/Doh-Nut/mini-services/social-sync/check-profiles.mjs:417` implements `simulateDispatch`; it prints simulated success and writes only simulation JSON | A successful simulation does not establish delivery |
| Schedule material exists | Parsed `brand-system/social-schedule-matrix.json`: 7 days, 105 entries, 21 each for TikTok/Instagram/Threads/Facebook/X; zero missing media file references | Reuse the material as draft input; asset existence does not verify playable media, rights, dimensions, or factual claims |
| Declared upload ledger is absent locally | `mini-services/social-sync/posts_history.db` does not exist | The declared duplicate-post protection is not demonstrated |
| Schedule is relative rather than executable | Entries use day number and clock strings; inspected structure has no campaign start date, per-post absolute due time, publication receipt, or task owner | A worker cannot reliably decide which dated post is due without an import contract |
| The local validator currently fails | Read-only normal invocation exits 1 with three blueprint validation errors listed below | Existing validation is not a green release gate |
| WebApp is running | Listener found on 127.0.0.1:9220; GET `/api/dohnut/social/accounts` returns HTTP 200 | The management surface is reachable |
| WebBridge is running now | Connector status: daemon running, extension connected, auth active | Browser transport is available; specific account sessions and publish permissions remain unverified |
| Default swarm spawn simulates work | `Hermes-WebApp/backend/services/swarm_manager.py:74` builds a Python command that sleeps 12 seconds and prints completion when no custom command is supplied | Default success does not prove an actual Hermes task ran |
| WebBridge publish route only navigates | `backend/routers/dohnut.py:224`: request content/title/image are not used for composing or uploading; route navigates and returns `ok: true` even when `nav_res` contains failure | The response cannot establish that a draft was composed, sent, or published |
| Approval response implies dispatch without dispatching | `backend/routers/social.py:192`: updates SQLite, sets `published_at` on approval, echoes `platforms_dispatched`; no publisher is invoked | Approval and publication are conflated |
| Account readiness is static | `backend/routers/dohnut.py:128` returns literal VERIFIED/PENDING labels | Profile URLs and old manual checks cannot establish current OAuth scopes, expiry, account type, or posting access |
| Content generators use fixed templates | `backend/routers/social.py:79` and `backend/routers/dohnut.py:146` construct strings directly; the inspected generation functions do not call Hermes or read project brand material | A topic can produce unrelated or unsupported copy rather than a grounded campaign |
| Operational stats mix seed values and optional live data | `backend/routers/dohnut.py:54` returns fixed top-level revenue/orders and appends a separate live section if retrieval works | A conductor must not interpret the seed values as current business performance |
| State paths need reconciliation | Generic social router writes root `social_autopilot.db`; Doh-Nut router declares `var/lib/social_autopilot.db` but inspected campaign generation does not persist there | Inventory existing schemas/data before selecting and migrating the canonical publication store |

Validator output:

```text
Facebook blueprint missing contact or banner spec
X bio exceeds 160 chars
YouTube blueprint spec incomplete
AUDIT_EXIT_CODE=1
```

These are checks of local blueprint text, not verified defects on the actual social accounts. No simulation dispatch was run in this inspection.

Both repositories have pre-existing dirty working trees, including ongoing WebApp swarm/auth/UI work. Preserve and integrate those edits; re-read affected files immediately before implementation.

## System ownership

| Layer | Responsibility | Must not imply |
| --- | --- | --- |
| Hermes-WebApp | User briefs, campaign review, schedules, approvals, task progress, evidence and performance views | That a click or HTTP 200 means a mission completed |
| Hermes runtime and native Kanban | Planning, worker assignment, dependencies, durable mission lifecycle, recovery, and verification | That process exit 0 alone validates a deliverable |
| Doh-Nut project | Current brand material, catalog interfaces, assets, creative specifications and project-specific checks | That historical brand notes prove current stock, prices, offers, opening hours or delivery promises |
| Social execution adapters | Account checks, media preparation, platform calls, status reconciliation and analytics retrieval | That opening a social site is publication |
| Publication database | Campaign/content versions, approvals, publication attempts, remote IDs and metric snapshots | That it is a second independent scheduler for the same Hermes tasks |

Keep the native Windows/Python/FastAPI/SQLite setup. Reuse Hermes Kanban rather than inventing another competing scheduler. The social database owns domain records; Kanban owns work execution. Link them through explicit campaign, post, task and run IDs.

## Complete campaign workflow

1. User submits a brief through WebApp or the existing chat interface: objective, dates, products, audience and allowed actions.
2. Backend validates the project mapping and creates an immutable brief version plus a durable Hermes mission. A request returns the mission ID, not a fake completion result.
3. Hermes obtains current brand rules and relevant catalog evidence from `G:/Doh-Nut` and its verified deployed service mapping.
4. Planner produces a content calendar and dependent worker tasks. Explicitly distinguish factual claims, approved offers and creative hypotheses.
5. Creative workers produce copy and actual assets for the selected channels. Preserve asset source, version/hash, rights metadata, product references and render evidence.
6. Review workers verify brand, factual claims, final assembled caption, links, media properties and channel requirements. Failed items return for revision.
7. WebApp previews exact content and assets. Approval binds account, content version, media hash, schedule and permitted action. Editing them invalidates the affected approval.
8. Scheduler dispatches due approved tasks. A worker rechecks account identity, capability, asset integrity, commercial offer validity and platform constraints immediately before execution.
9. Publisher stores the platform request/container identifier, reconciles processing, and records a remote post ID and URL when available. Ambiguous outcomes enter reconciliation before retries.
10. A verifier confirms account, media, text and visibility as far as the platform allows. UI reflects verified evidence and any limits of visibility checks.
11. Analytics worker collects supported metrics at configured intervals. Analyst recommends later content changes based on comparable observations, not guaranteed FYP timing.
12. Hermes creates follow-up work when justified. WebApp shows what happened, why, evidence, cost and the next decision.

## Publication state contract

```text
draft -> validating -> awaiting_approval -> approved -> scheduled
      -> publishing -> processing -> published -> verified

Side states: needs_revision, blocked, failed, reconciliation_required, cancelled
```

- `approved` records consent; it never sets `published_at`.
- `scheduled` requires an absolute `scheduled_at` and timezone provenance.
- `publishing` requires a valid run claim, authorized account and deduplication key.
- `processing` records an accepted upload/container or platform request; it is not a visible post.
- `published` requires platform evidence, including remote identity and a timestamp where available.
- `verified` requires a separate result check tied to the same post/content version.
- `reconciliation_required` represents uncertain external outcomes; do not issue blind duplicate posts.
- A campaign can be partially complete: an Instagram success does not conceal a TikTok failure.
- Metrics distinguish unavailable, delayed and measured zero values.

## Advanced conductor roles

Use logical roles with on-demand workers; do not run one permanent process per title.

| Role | Input | Required output |
| --- | --- | --- |
| Campaign planner | Objective, real business facts, prior results | Dated brief and task dependency graph |
| Researcher | Audience/topic questions and permitted sources | Dated source-backed observations and uncertainty |
| Creative producer | Approved brief, real product assets and brand rules | Rendered media plus provenance and editable source |
| Channel editor | Campaign content and channel requirements | Platform-specific content variants and assembled captions |
| Reviewer | Exact artifact versions and acceptance checks | Evidence-backed acceptance or actionable revision request |
| Publisher | Approved due content, verified account capability | Per-platform attempt history and publication receipt |
| Community operator | Authorized inbound interactions and current FAQs | Classified inbox items, permitted replies or review drafts |
| Analyst | Metric snapshots, clicks and trustworthy order data | Comparisons, limits of attribution and next experiments |

Community automation is a later workflow. Availability of replies, messages and webhooks must be checked per platform; publishing permission does not imply inbox access. Customer complaints, allergens, refunds and order-specific details require appropriate data and action scope.

## Platform integration strategy

- Instagram: verify a supported professional-account API path and actual account/token permissions. Meta's official collection documents content publishing, media processing status and insights. Select scopes for the chosen login path; do not mix Facebook Login and Instagram Login requirements.
- Facebook: verify that the target is the intended managed Page and that the integration has posting access. A public profile URL alone is insufficient evidence.
- Threads: evaluate the official API for publishing and supported insights/replies; verify permissions on the connected account.
- TikTok: direct-post API access is not automatically suitable for a private internal uploader. Current official guidelines exclude tools limited to accounts managed by the developer/team, require creator controls, and restrict unaudited clients. Evaluate an approved integration or a platform-supported workflow that fits the actual use case. Do not promise a fully headless custom Direct Post implementation or treat browser automation as an automatic policy workaround.
- X and YouTube: verify current account capability, API access/quota, credentials and channel existence before selecting a production path.
- Browser workflows: use only supported, tested flows, and verify the active account. A healthy shared WebBridge does not pin Chrome Profile 50 by itself. Concurrency must not let two jobs type into the same active tab.

The selected connector/provider and actual access cost remain open implementation decisions. Do not claim zero-cost delivery or guaranteed virality. Browser timing randomization does not establish shadowban protection.

## Concrete implementation boundaries

These are proposed locations and behaviors, not files or endpoints already implemented:

1. Extend WebApp service modules for campaign storage, Hermes mission submission and publication orchestration. Keep FastAPI routes thin and use typed request/result contracts.
2. Replace default demo swarm execution with an explicit demo mode and a tested Hermes adapter. Bind `project_id=dohnut` to an allowlisted absolute workspace; accept structured tasks rather than arbitrary browser-provided shell commands.
3. Reconcile existing social SQLite stores through an inspected, backed-up migration. Add versioned content, per-platform attempts, approvals, account capability snapshots and analytics snapshots.
4. Adapt existing WebApp progress transport to persisted run events. Reconnect with an event cursor; a UI reload must not lose or restart work.
5. Reuse `G:/Doh-Nut/mini-services/social-sync` for project-specific validation/import support. Import existing schedule material as drafts with an explicit start date and real timestamps. Do not enqueue all 105 entries automatically.
6. Preserve the storefront's design. Operational controls belong in Hermes-WebApp; no new marketing dashboard is required inside the customer shop.
7. Keep project configuration reusable: workspace, brand paths, verified store URL, account IDs, content policy and asset locations. Later brands get their own mappings, data scope and credentials.

## Priority implementation slices

### Slice 1: Truthful controls and a real Hermes task

Correct status semantics, isolate demo values, and connect WebApp mission submission to a real Hermes worker using `G:/Doh-Nut`. Deliver one saved, grounded campaign draft with a run ID, artifacts and verifier result. No external publication is needed to demonstrate this slice.

### Slice 2: One verified channel end to end

Choose the first channel from actual account capability checks. Build approval, due-time execution, publisher, processing reconciliation and proof. Test transient errors and a worker restart in an isolated setup. Prepare exact content and target for authorized publication.

### Slice 3: Reusable multi-platform workflow

Add channel variants and additional adapters. Demonstrate partial completion, account isolation, stale approval rejection, no duplicate side effects and resumable progress. Choose concurrency from measured host and provider limits.

### Slice 4: Analytics and community follow-up

Collect supported post metrics, add tagged outbound links, and connect to accurate business data where available. Attribution is observational unless supported by a valid experiment. Add scoped community workflows only after verifying inbox capabilities and approved response rules.

## Acceptance gates

- A brief from WebApp causes a real Hermes execution in the intended project and produces inspectable artifacts.
- A title, topic, tone and actual product changes cause corresponding grounded content changes.
- Missing or unverified offers, prices, stock or opening hours cannot silently become published claims.
- Approving a draft changes only its approval state; it does not assert dispatch/publication.
- A publish attempt without a verified account or required authorization cannot run.
- An accepted upload is displayed as processing until the platform returns publication evidence.
- A timeout after possible remote acceptance reconciles before any retry.
- A restart preserves progress and does not duplicate a scheduled publication.
- An edited asset or caption invalidates its previous approval and check receipt.
- Analytics show real measured data and provenance; seed revenue is excluded from optimization decisions.
- The same workflow can support another brand through configuration while preserving isolation.

## Official references and verification limits

- Hermes durable tasks: https://hermes-agent.nousresearch.com/docs/user-guide/features/kanban
- Hermes worker contracts: https://hermes-agent.nousresearch.com/docs/user-guide/features/kanban-worker-lanes
- Meta-maintained Instagram API collection: https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api
- Meta-maintained Threads collection: https://www.postman.com/meta/threads/documentation/dht3nzz/threads-api
- TikTok publishing guidelines: https://developers.tiktok.com/docs/en/content-sharing-guidelines

Direct Meta documentation fetches returned HTTP 429; the Meta-maintained collections were consulted instead. No social OAuth scopes, token expiry, actual publishing permissions or live publishing flow were validated in this review. Source findings do not constitute a complete UI/security audit or runtime end-to-end test.
