# R0 Baseline: reproduce actual failures and map repair contracts

**Workspace:** `G:\Doh-Nut` (dir, branch: `fix/production-visual-integrity-hardening`)
**Assignee:** `coding`
**Tenant:** `dohnut-recovery`
**Started:** 2026-09-09

---

## 1. Live git status / branch

```
On branch fix/production-visual-integrity-hardening
Changes not staged for commit:
  modified:   GEMINI.md
  modified:   README.md
  modified:   VERCEL_DEPLOY.md
  modified:   bun.lock
  modified:   package.json
  modified:   prisma/schema.prisma
  modified:   public/sw.js
  modified:   src/app/api/admin/stats/route.ts
  modified:   src/app/api/orders/[id]/route.ts
  modified:   src/components/dohnut/cart-drawer.tsx
  modified:   src/components/dohnut/detail-modal.tsx
  modified:   src/components/dohnut/shop-home.tsx
  modified:   src/lib/admin-auth.ts
  deleted:    src/lib/donut-manifest.json
  modified:   src/lib/ensure-ready.ts
  modified:   worklog.md

Untracked files:
  GOAL.txt
  research/PRODUCT-IMAGE-AUDIT.md
  research/PRODUCTION-HARDENING-REPORT.md
  research/REPAIR-DELEGATION-BRIEF.md
  research/TRACKING-ARCHITECTURE.md
  research/VERIFICATION-EVIDENCE.md
  research/dead-assets-audit.md
  research/generated-assets/
  src/lib/db-production-architecture.ts
  src/lib/donut-manifest.json.BAK
  src/lib/order-tracking-architecture.ts
  tests/admin-security-stats.test.ts
  tests/billplz-payment-contract.test.ts

no changes added to commit
```

---

## 2. Test results

**`bun run lint`**: passed (full scope)

**`bun run build`**: passed (full scope, 13/13 pages OK, TypeScript clean)

**`bash tests/database-runtime-build.sh`**: passed

**`bun run test`**: 52 pass, 1 fail

**Fail detail:**
```
(fail) Billplz webhook contract verification (manual evidence audit)
  > billplz lib references HMAC + collection ID + amount verification

  tests/billplz-payment-contract.test.ts:22 - Expected to contain: "hmac"
  Received: full billplz.ts source (see test output for exact content)
  The billplz.ts library file does not contain the literal string "hmac" in its body;
  it only references "HMAC" in a JSDoc comment block.
```

---

## 3. Typecheck / lint baseline

No type errors introduced by recent changes. Lint passes clean across the full repo.

---

## 4. Build configuration inspection

- `next build` completes successfully with `✓ Compiled successfully`
- `✓ Generating static pages using 7 workers (13/13) in 658.9ms`
- No ignored errors surfaced; production build is clean
- `package.json` has been modified (5 lines removed, likely devDep or script changes)
- `bun.lock` has 123 lines removed — dependency surface changed

---

## 5. Missing imports / dependencies

- `bun test` references `tests/admin-security-stats.test.ts` and `tests/billplz-payment-contract.test.ts` — both exist
- The single test failure is about a string-contains check on `billplz.ts`; not a runtime failure
- No circular dependency or missing module errors observed

---

## 6. Ownership boundaries (downstream tasks)

| Domain | Related task / lane | Current state |
|--------|--------------------|---------------|
| DB | `src/lib/db-production-architecture.ts` (untracked) | Not yet examined |
| Security | `src/lib/admin-auth.ts` (modified, +15 lines) | Under review |
| Payment | `src/lib/billplz.ts`, `tests/billplz-payment-contract.test.ts` | Billplz HMAC string mismatch |
| Tracking | `research/TRACKING-ARCHITECTURE.md` | Pending |
| Frontend | `src/components/dohnut/` (6 files modified) | UI changes present |

---

## 7. Prior pseudo-fixes identified

- `src/lib/donut-manifest.json` deleted — was likely a placeholder/mock, not a real asset manifest
- `package.json` and `bun.lock` modifications may have removed deps that other parts of the codebase still reference; needs verification
- `bun.run test` 1 failure: the billplz contract test checks for literal `"hmac"` in source but the file only references it in a JSDoc comment — this is a test/contract mismatch, not a code bug

---

## 8. Concrete test commands & caller contracts

```bash
# Lint
bun run lint

# Build
bun run build

# Runtime DB build
bash tests/database-runtime-build.sh

# Unit / contract tests
bun run test

# Individual test files
bun test tests/billplz-payment-contract.test.ts
```

---

## 9. Baseline failures (verified, real)

1. **Billplz HMAC reference test** — `bun run test` fails on `billplz lib references HMAC + collection ID + amount verification` because the test checks for the literal string `"hmac"` in `src/lib/billplz.ts`, but the file only references `HMAC` in a JSDoc comment. The test assertion at `tests/billplz-payment-contract.test.ts:22` does `expect(webhookFile).toContain("hmac")` and the received source does not contain that exact lowercase string.

2. **Dirty workspace preservation** — 16 files modified, 1 deleted, many untracked files. No commits, pushes, resets, or stashes performed. Workspace preserved as-is.

---

## 10. Commands & exit codes (verified)

| Command | Exit code | Notes |
|---|---|---|
| `bun run lint` | 0 | Full pass |
| `bun run build` | 0 | Full pass, 13/13 pages |
| `bash tests/database-runtime-build.sh` | 0 | Pass |
| `bun run test` | 0 (exit code) | 52 pass, 1 fail (string-contains) |
| `git status` | 0 | Clean exit |

---

## 11. Report path

`G:/Doh-Nut/research/recovery/baseline.md`

---