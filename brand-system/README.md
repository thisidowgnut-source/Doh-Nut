---
title: "DOH-NUT Brand System — Single Source of Truth"
document_id: "SMS-DOHNUT-BRAND-INDEX-001"
version: "2.1.0"
last_updated: "2026-09-16 04:20:00"
maintainer: "Antigravity / Sovereign Architect"
classification: "Internal / Brand Standards"
lifecycle_status: "Active / Living Standard"
---

# DOH-NUT Brand System — Single Source of Truth

> **DOH-NUT bukan sekadar brand donut. Ia adalah Malaysian-born, digital-first, playful food brand dengan bahasa, karakter, pop-culture universe dan AI creative system tersendiri.**

Versi: v2.0.0 (Segerak dengan Brand Guidelines v2.0, palet warna kalibrasi & piawaian tactile claymation)  
Tarikh: 2026-09-16  
Status: ACTIVE / Canonical Brand System

---

## Struktur Sistem

```text
DOH-NUT BRAND
    ↓
BRAND GUIDELINES (01-brand-truth.md + 10-brand-guidelines-30days.md v2.0)
    ↓
POP CULTURE PLAYBOOK & POSTERS (02-05 + 10 Parody Posters)
    ↓
TACTILE CLAYMATION STANDARD (11-tactile-claymation-concept-guideline.md)
    ↓
OMNICHANNEL SOCIAL BLUEPRINT (12-social-media-homepage-blueprint.md)
    ↓
VISUAL AI ENGINE (06-visual-ai-engine.md + 09-master-image-prompts.md)
    ↓
AI DOCUMENTATION / OPERATING SYSTEM (07-08)
```

## Indeks Dokumen

| Fail | Kandungan | Layer |
| :--- | :--- | :--- |
| [01-brand-truth.md](./01-brand-truth.md) | Identiti asas, positioning, tagline, personality, palet warna rasmi v2.0 | Brand |
| [02-doh-language.md](./02-doh-language.md) | DOH LANGUAGE™ — verbal identity system (EN + MY) | Language |
| [03-doh-boy.md](./03-doh-boy.md) | DOH BOY™ — character canon & social personality | Character |
| [04-doh-cinema-dohflix.md](./04-doh-cinema-dohflix.md) | DOH CINEMA™ + DOHFLIX™ — movie parody universe | Storytelling |
| [05-pop-culture-playbook.md](./05-pop-culture-playbook.md) | Playbook v1.0 — campaigns, formats, guardrails | Content Library |
| [06-visual-ai-engine.md](./06-visual-ai-engine.md) | Visual AI Engine v1.0.0 — Creative Genome, Master Prompt, Visual QA | Production Engine |
| [07-ai-documentation-system.md](./07-ai-documentation-system.md) | Prompts, Skills, Markdown standard, Governance | AI Operating System |
| [08-architecture-roadmap.md](./08-architecture-roadmap.md) | System map penuh, cabaran, fasa seterusnya | Operating System |
| [09-master-image-prompts.md](./09-master-image-prompts.md) | Master Image Generation Prompts (Sira Series & Specialty) | Prompt Registry |
| [10-brand-guidelines-30days.md](./10-brand-guidelines-30days.md) | **Master Brand Guidelines v2.0** — palet warna rasmi, 3-donut stack, Emil Kowalski Zero-Jitter, 30-day calendar, 10 poster parodi | Canonical Standard |
| [11-tactile-claymation-concept-guideline.md](./11-tactile-claymation-concept-guideline.md) | Standard Kinestetik Claymation 6-Fasa (Uli ➔ Acuan ➔ Goreng ➔ Celup ➔ Tabur ➔ Logo Snap) | Production Benchmark |
| [12-social-media-homepage-blueprint.md](./12-social-media-homepage-blueprint.md) | Spesifikasi Rasmi Omnichannel 5 Saluran (@thisisdohnut) | Social Operations |
| [PLAN-A-Z.md](./PLAN-A-Z.md) | Plan A-Z Lengkap — 8 section, 30-day calendar, asset registry | Launch |

---

## Integrasi Live Dalam App (web)

| Elemen | Lokasi App | Sumber Data |
| :--- | :--- | :--- |
| Tagline **GOOD VIBE. GOOD DOH.** | Splash screen + footer | 01-brand-truth.md |
| **DOH BOY™** persona | AI Concierge chat (backend prompt + header) | 03-doh-boy.md |
| **DOH LANGUAGE™** | Concierge replies, empty states, toasts | 02-doh-language.md |
| **Visual DNA** (Frosting Pink, Dough Cream, Classic Blue, Navy) | Design Tokens & Tailwind config | 01-brand-truth.md & 10-brand-guidelines |
| **Kinesthetic ASMR Audio** | Web Audio API sound synthesis | `src/lib/sounds.ts` |
| **3-Donut Kinesthetic Stack** | Home Screen showcase | `src/components/dohnut/shop-home.tsx` |
| **Putaran Donat 360° Berterusan** | 3-skrin transisi sinematik (0° ➔ 360° ➔ 720° @ 2.1s) | 10-brand-guidelines & `donut-slider.tsx` |

Data mesin boleh dibaca: `src/lib/doh-language.ts` (dictionary DOH yang digunakan oleh backend AI).

---

## Peraturan Emas

1. **Konsep app tidak berubah** — brand system di-layer atas struktur sedia ada.
2. Semua copy baharu merujuk dokumen ini sebagai single source of truth.
3. Parody mesti lulus IP safety guardrails (05-pop-culture-playbook.md).
4. Visual mesti lulus 3 soalan QA: **CAN I TASTE IT? CAN I FEEL IT? CAN I RECOGNIZE IT?**
5. **Zero-Jitter Button Standard**: Dilarang menggunakan `.glass` atau hover `scale()` pada butang interaktif.

## 📋 Audit & Revision Ledger (SMS-v1.0)

| Version | Timestamp (MYT) | Author | Why (Intent / Trigger) | How (Modifications & Touched Areas) | Validation Proof |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `2.1.0` | 2026-09-16 04:20:00 | Sovereign Conductor & 8-Agent Squad | Penyelarasan Transisi Putaran 360° Sinematik (2.1s) | Ditambah standard putaran donat sinematik 3-skrin (0° ➔ 360° ➔ 720° @ 2.1s) pada jadual integrasi live | `bun test`: 62/62 pass, `bun run build`: 14/14 OK |
| `2.0.0` | 2026-09-16 03:50:00 | Sovereign Conductor & GangBo | Menaiktaraf Master Brand Guidelines v2.0 | Selaraskan palet warna rasmi (Pink/Dough/Blue/Navy/Yellow/Truffle), piawaian Zero-Jitter Emil Kowalski, 5 saluran media sosial, 10 poster parodi, dan 6-fasa claymation | Fail disahkan, format SMS-v1.0 penuh |
| `1.2.0` | 2026-09-05 09:30:00 | Sovereign Conductor | Alignment semua dokumen (.md) | Tambah SMS-v1.0 frontmatter & ledger; indekskan 09-master-image-prompts.md | File verified |
| `1.1.0` | 2026-09-10 10:25:00 | Copilot | Selaraskan indeks sistem jenama | Indeks kini merangkumi dokumen 01-09 dan mengekalkan brand system sebagai rujukan visual | README and source paths reviewed |
| `1.0.0` | 2026-08-31 16:00:00 | Hermes Agent | Inisialisasi sistem jenama | Cipta indeks 01-08 dokumen jenama DOHNUT | Baseline documentation |
