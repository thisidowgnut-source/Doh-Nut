---
title: "DOH-NUT Repository Guidelines"
document_id: "SMS-DOHNUT-AGENTS-001"
version: "1.7.0"
last_updated: "2026-09-16 14:15:00"
maintainer: "Antigravity / Sovereign Architect"
classification: "Internal / Developer Guidelines"
lifecycle_status: "Active / Living Standard"
---

# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 16 App Router storefront written in TypeScript. Pages, layouts, and route handlers live in `src/app`; API endpoints are under `src/app/api`. Product components belong in `src/components/dohnut`, reusable shadcn/Radix primitives in `src/components/ui`, shared logic in `src/lib`, and client state in `src/store`. Prisma schema and seed data (curating **31 donut flavors**) live in `prisma/` and `src/lib/seed-data.ts`. Static assets and the service worker belong in `public/`. Deployment helper tests are Bash scripts under `tests/`; `mini-services/order-tracking` is a separate Bun service. Treat `research/`, `brand-system/`, and `examples/` as supporting material. Catalog image references must resolve to local files; historical image-audit reports may document older duplicates or intentional deletions.

## Build, Test, and Development Commands

- `bun install` installs dependencies from `bun.lock`.
- `bun run dev` starts Next.js on `http://localhost:3000`.
- `bun run lint` runs the Next.js ESLint configuration across the repository.
- `bun run build` creates the standalone production build and copies required static assets.
- `bun run db:generate` regenerates Prisma Client after schema changes.
- `bun run db:migrate` creates and applies a local development migration.
- `bash tests/database-runtime-build.sh` runs a deployment-script integration test. Run the other `tests/*.sh` similarly; the container test also requires Docker.
- `bun test` runs the repository's Bun tests.
- `bun run build` is the release gate after UI, route, or shared-library changes.

## Coding Style & Naming Conventions

Use two-space indentation, double quotes, semicolons, and TypeScript types at module boundaries. Prefer the `@/` alias over long relative imports. Name React components and exported types in PascalCase, functions and hooks in camelCase (`useShop`), and files/routes in kebab-case. Keep route handlers thin and move reusable validation, pricing, authentication, and database logic into `src/lib`. Run `bun run lint` before submitting; no Prettier configuration is committed.

## Testing Guidelines

Bun is the JavaScript test runner; there is no Jest/Vitest coverage gate. For every change, lint and build locally, then exercise the affected UI or API flow. Add regression tests beside the existing Bash integration tests when changing `.zscripts`; name them after the behavior, such as `database-runtime-build.sh`.

## Commit & Pull Request Guidelines

Recent descriptive commits use Conventional Commits, for example `fix(build): guard standalone asset copy`. Prefer `feat:`, `fix:`, `test:`, `docs:`, or `chore:` with an optional scope. Keep commits atomic. Pull requests should explain intent and risk, link related issues, list verification commands, note schema or environment changes, and include screenshots or recordings for visible UI changes.

## Security & Configuration

Copy `.env.example` to `.env.local`; never commit credentials or database files. Validate all request input, preserve session scoping, and require `ADMIN_API_KEY` for privileged production routes. Treat payment webhook or Billplz changes as security-sensitive and test signatures and failure paths.

## 📋 Audit & Revision Ledger (SMS-v1.0)
| Version | Timestamp (MYT) | Author | Why (Intent / Trigger) | How (Modifications & Touched Areas) | Validation Proof |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `1.7.0` | 2026-09-16 14:15:00 | Sovereign Conductor & 8-Agent Squad | Pemasangan Suite Kemahiran UI/UX FRONTEND S-Rank | Pasang `ui-ux-pro-max` (global + CLI), `frontend-design` (Anthropic), `design-taste-frontend` (Leonxlnx), scaffold `.agents/skills` | `python search.py`: OK, `bun test`: 62/62 pass |
| `1.6.5` | 2026-09-16 07:20:00 | Sovereign Conductor & 8-Agent Squad | Penalaan Heuristik P1 (CTA Pink, Kontras Rating, Scrollbar-None) | Selaras CTA Favorites ke Frosting Pink, tingkatkan kontras rating ★4.9 (Navy + Amber star), buang palang skrol kelabu pelayar | `bun test`: 62/62 pass, `bun run build`: 14/14 OK |
| `1.6.4` | 2026-09-16 04:20:00 | Sovereign Conductor & 8-Agent Squad | Penalaan Kelajuan Animasi Donat 20% Lebih Pantas (2.1s) | Durasi putaran dan gelungsuran 2.6s ➔ 2.1s (ShopHome, RingCard, Half-Donut), delay siblings 0.7s, delay kad bawah 0.75s, delay nutrisi 0.4s-0.7s | `bun test`: 62/62 pass, `bun run build`: 14/14 OK |
| `1.6.3` | 2026-09-16 04:15:00 | Sovereign Conductor & 8-Agent Squad | Putaran Donat 360° Menyeluruh (1 ➔ 2 ➔ 3) | 1(0°) ➔ 2(360°) ➔ 3(720°), siblings ring fade in delay 0.85s, kad bawah delay 0.95s, viewVariants x:0 | `bun test`: 62/62 pass, `bun run build`: 14/14 OK |
| `1.6.2` | 2026-09-16 04:05:00 | Sovereign Conductor & 8-Agent Squad | Penalaan Donat Berguling 360° (2.6s & easeInOutCubic) | Tambah 30% durasi kepada 2.6s, putaran penuh 360°, easeInOutCubic [0.37, 0, 0.63, 1], Home ➔ Slider 1.6s | `bun test`: 62/62 pass, `bun run build`: 14/14 OK |
| `1.6.1` | 2026-09-16 03:55:00 | Sovereign Conductor & 8-Agent Squad | Penalaan Transisi Sinematik Donat (2.0s Slow Rolling & Glide) | Donat layout & rotate duration 2.0s (ease [0.16, 1, 0.3, 1]), selaras kad nutrisi & total, Home ➔ Slider 1.2s | `bun test`: 62/62 pass, `bun run build`: 14/14 OK |
| `1.6.0` | 2026-09-16 03:15:00 | Sovereign Conductor & 8-Agent Squad | Transisi Donat Berterusan (Zero Blink / Zero Disappear) | `popLayout` mode pada `page.tsx`, `slider` initial opacity 1, `RingCard` unmount image bila `detailOpen`, donat glide perlahan ke kanan (0.75s) | `bun test`: 62/62 pass, `bun run build`: 14/14 OK |
| `1.5.0` | 2026-09-15 22:55:00 | Sovereign Conductor & 8-Agent Squad | Penaiktarafan Wireframe v2.0 (100% Konsep Doh-Nut) | Bina semula wireframe-board.tsx menyamai 100% struktur asal: 3-donat stack, 3D ring, 44%/56% split detail, 4-item bottom-nav | `bun test`: 62/62 pass, `bun run build`: 14/14 OK, HTTP 200 on /wireframe |
| `1.4.0` | 2026-09-15 22:05:00 | Sovereign Conductor & 8-Agent Squad | Audit UI/UX menyeluruh & delegasi sub-ejen | Brand hygiene (Doh-Nut), Next.js Image style fix, scrollbar-none pills, safe area padding, Sound Effects toggle | `bun test`: 62/62 pass, `bun run build`: 14/14 OK, console: 0 errors / 0 warnings |
| `1.3.0` | 2026-09-10 10:25:00 | Copilot | Selaraskan dokumentasi dengan transition Home → Slider, wireframe, preview, dan plugin workflow | Dokumentasikan `LayoutGroup`/`AnimatePresence`, `layoutId`, `/wireframe`, build gate, dan Bun tests | `bun run build`: berjaya |
| `1.2.0` | 2026-09-05 09:30:00 | Sovereign Conductor | Alignment dokumen projek (.md) | Tambah SMS-v1.0 frontmatter, ledger, dan segerakkan 31 perisa katalog | `bun run build`: 13/13 pages OK |
| `1.0.0` | 2026-08-25 12:00:00 | Core Team | Inisialisasi garis panduan repositori | Asas panduan kod, struktur modul, dan sekuriti | Baseline approval |
