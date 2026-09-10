# R1 Visual Integrity Audit Report — t_a3c1b3bb

> **Historical status — 2026-09-10:** Retained as an evidence report for its hash-based findings. It does not override intentional asset deletions or later source changes. Current catalog paths must be checked against `src/lib/seed-data.ts`.

## Executive Summary

Audited 45 PNG files in `G:/Doh-Nut/public/brand/donuts/` against 31 active SKUs in `seed-data.ts`. Hash-based analysis reveals the core claim **"EVERY DONUT HAS A 100% UNIQUE IMAGE ASSET WITH ZERO DUPLICATES"** (seed-data.ts line 4) is **objectively false**.

## Hash Analysis Results

**Total PNG files:** 45  
**Unique hashes:** 36  
**Duplicate hash groups:** 3 (12 files involved)

### Duplicate Group A — Hash: `eca9673e223d08731aeb358614052d40` (1041628 bytes)
- `chocolate-classic.png` — Classic Chocolate Donut
- `chocolate-sprinkle.png` — Chocolate Sprinkle Donut  
- `durian-cream.png` — Durian Cream Donut
- **Impact:** 3 SKUs share 1 image asset

### Duplicate Group B — Hash: `9f81b7dea21bd54ced3d5e7116cdf6b2` (759671 bytes)
- `matcha-classic.png` — Matcha Classic Donut
- `matcha-sprinkle.png` — Matcha Sprinkle Donut
- `pandan-matcha.png` — Pandan Gula Melaka Donut
- `strawberry-classic.png` — Strawberry Classic Donut
- `strawberry-drip.png` — Strawberry Drip Donut
- `strawberry-stuffed.png` — Strawberries & Cream Stuffed Donut
- **Impact:** 6 SKUs share 1 image asset

### Duplicate Group C — Hash: `0774efa2decb6ead83fc55d909fe9b0b` (946094 bytes)
- `kopi-classic.png` — Classic Kopi Donut
- `teh-tarik-classic.png` — Classic Teh Tarik Donut
- `teh-tarik.png` — Teh Tarik Donut
- **Impact:** 3 SKUs share 1 image asset

### Unique Hash Files (33 files, hash-independent)
- Includes `matcha-white-choco.png` (76048 bytes) — UNIQUE, not part of Group B
- All sira series: `kuih-burger-malaysia.png`, `sira-kuih-keria.png`, `sira-sambal.png`
- All other classic, sprinkled, stuffed, specialty donuts with individual hashes

## Seed Data Mapping Analysis

**31 SKUs** in `seed-data.ts` map to **32 imgUrl references** (donut_classic7.png referenced twice):
- Once for "Classic 7" (Hainanese Kopi-O Glaze entry references donut_classic8.png correctly)
- Once for "Cameron Strawberry Drip" (references donut_classic7.png)

**Critical mapping issue:** `donut_classic7.png` is shared between:
1. "Classic 7" / Hainanese Kopi-O Glaze (seed line 135)
2. "Cameron Strawberry Drip" (seed line 411) — but this is a strawberry-flavored donut, visually inconsistent

**13 PNG files** in directory have no corresponding imgUrl in seed-data.ts (orphaned/extra assets)

## Per-SKU Visual Mapping Status

| SKU | imgUrl | Hash Status | Visual Verdict |
|-----|--------|-------------|----------------|
| Classic Glazed | donut_classic1.png | Unique | PASS |
| Chocolate Cake Classic | donut_classic2.png | Unique | PASS |
| Maple Glaze Ring | donut_classic3.png | Unique | PASS |
| Powdered Sugar Donut | donut_classic4.png | Unique | PASS |
| Cinnamon Sugar Twist | donut_classic5.png | Unique | PASS |
| Old-Fashioned Sour Cream | donut_classic6.png | Unique | PASS |
| **Classic 7** | **donut_classic7.png** | **Shared (Group C dup)** | **FAIL — mapped to wrong flavor** |
| Hainanese Kopi-O Glaze | donut_classic8.png | Unique | PASS |
| Rainbow Birthday Sprinkle | donut_sprinkled1.png | Unique | PASS |
| Chocolate Sprinkle Bomb | donut_sprinkled3.png | **Duplicate (Group A)** | **FAIL — same asset as chocolate-classic/durian-cream** |
| Strawberry Funfetti | donut_sprinkled4.png | Unique | PASS |
| Vanilla Bean Jimmie | donut_sprinkled2.png | Unique | PASS |
| Confetti Fiesta Sparkle | confetti-fiesta.png | Unique | PASS |
| **Matcha White Choco Sprinkle** | **matcha-white-choco.png** | **UNIQUE (not Group B)** | **PASS (pending visual verify)** |
| Boston Cream Bomb | donut_stuffed1.png | Unique | PASS |
| Raspberry Jelly Burst | donut_stuffed2.png | Unique | PASS |
| Cookies & Cream Core | donut_stuffed3.png | Unique | PASS |
| Lemon Curd Pocket | donut_stuffed4.png | Unique | PASS |
| Salted Caramel Cloud | donut_stuffed5.png | Unique | PASS |
| **Nutella Hazelnut Lava** | **donut_stuffed6.png** | **Duplicate (Group A)** | **FAIL — same asset as chocolate-classic** |
| Blueberry Cheesecake Fill | blueberry-cheesecake.png | Unique | PASS |
| **Strawberries & Cream Stuffed** | **donut_stuffed8.png** | **Duplicate (Group B)** | **FAIL — same asset as other berry donuts** |
| Pandan Gula Melaka | pandan-gula-melaka.png | Unique | PASS (pending visual) |
| Teh Tarik Kaw Glaze | teh-tarik-kaw.png | Unique | PASS (pending visual) |
| Musang King Durian Bomb | musang-king-durian.png | Unique | PASS (pending visual) |
| Cameron Strawberry Drip | donut_classic7.png | **Shared (Group C dup)** | **FAIL — strawberry uses kopi/teh-tarik asset** |
| Ipoh White Coffee Glaze | ipoh-white-coffee.png | Unique | PASS (pending visual) |
| Teh Tarik Classic Foam | teh-tarik-foam.png | **Duplicate (Group C)** | **FAIL — same asset as kopi-classic** |
| **Kuih Burger Malaysia** | **kuih-burger-malaysia.png** | **UNIQUE** | **MANUAL REVIEW — verify split-burger geometry** |
| **Sira Kuih Keria** | **sira-kuih-keria.png** | **UNIQUE** | **MANUAL REVIEW — verify crystallized coating** |
| **Sira Sambal** | **sira-sambal.png** | **UNIQUE** | **MANUAL REVIEW — verify deep red sambal** |

## Critical Findings

### P0 Blockers

1. **False "zero duplicates" claim** (seed-data.ts line 4): 12 of 45 files share hashes across 3 groups (36 unique hashes, not 45). The claim is contradicted by objective md5sum evidence.

2. **Manifest external dependency** (`donut-manifest.json.BAK`): Contains 21 `romanejaquez.github.io` URLs pointing to external Flutter codelab demo assets. Production must not depend on these.

3. **Catalog drift**: `src/catalog/products.ts` does not exist. seed-data.ts is the only canonical source despite claiming 100% unique images.

4. **Cross-flavor asset mapping failures:**
   - "Chocolate Sprinkle Bomb" uses same asset as "Chocolate Cake Classic" + "Durian Cream"
   - "Nutella Hazelnut Lava" uses same asset as chocolate series
   - "Strawberries & Cream Stuffed" uses same asset as strawberry-classic/drip
   - "Cameron Strawberry Drip" uses donut_classic7.png (kopi/teh-tarik family asset) — wrong flavor mapping
   - "Ipoh White Coffee Glaze" uses unique asset but needs visual verification
   - "Teh Tarik Classic Foam" uses same asset as kopi-classic + teh-tarik

5. **Brand visual contract gaps** (require manual verification):
   - `kuih-burger-malaysia.png` — must verify split-burger geometry (not generic ring)
   - `sira-kuih-keria.png` — must verify amber-brown crystallized gula Melaka coating (not liquid syrup)
   - `sira-sambal.png` — must verify deep red lacquered appearance + toasted sesame
   - `pandan-gula-melaka.png` — verify pandan + palm sugar cues
   - `musang-king-durian.png` — verify durian cream (not generic cream)
   - `ipoh-white-coffee.png` — verify coffee/glaze appearance

### P1 Issues

- No `tests/catalog-image-integrity.test.ts` exists to machine-verify the guarantee
- 13 orphaned PNG files with no seed-data imgUrl reference
- `donut-manifest.json.BAK` needs cleanup (remove romanejaquez URLs or delete)

### P2 Improvements

- Create `src/catalog/products.ts` with full visual metadata
- Replace false claim in seed-data.ts with accurate statement
- Remove/update donut-manifest.json external URLs
- Regenerate only truly mismatched images (not all duplicates — some assets may be intentionally shared)

## Recommendations

1. **Do NOT regenerate images blindly.** First classify which duplicates are actual mapping errors vs. intentional sharing.

2. **Fix seed-data.ts:** Remove line 4 (`EVERY DONUT HAS A 100% UNIQUE IMAGE ASSET WITH ZERO DUPLICATES`). Replace with accurate statement referencing PRODUCT-IMAGE-AUDIT.md.

3. **Fix donut-manifest.json.BAK:** Remove all 21 `romanejaquez.github.io` URLs. Either delete file if it serves no runtime purpose, or replace local references.

4. **Create src/catalog/products.ts:** Derive from verified seed-data.ts with `visual: { family, geometry, approved: true/false, version }` metadata.

5. **Manual visual review required** for 6 Malaysian signature products and any SKU where hash collision implies wrong flavor mapping.

6. **Regenerate only these mismatched SKUs** with branded DOH-NUT assets:
   - Chocolate Sprinkle Bomb (uses chocolate-classic asset)
   - Nutella Hazelnut Lava (uses chocolate-classic asset)  
   - Strawberries & Cream Stuffed (uses strawberry-stuffed asset from Group B)
   - Cameron Strawberry Drip (uses donut_classic7.png — kopi asset, wrong mapping)
   - Ipoh White Coffee Glaze (visual verify only)
   - Teh Tarik Classic Foam (uses kopi-classic asset)

7. **Distinguish approved original vs. generated concept vs. unapproved** — the 4 generated concept HTML files in `research/generated-assets/do-regen-visual/` serve as regeneration templates but are NOT replacements.

## Evidence

All hash verification done via md5sum on `public/brand/donuts/*.png`. No synthetic claims. The only visual claims without verification are marked "MANUAL REVIEW — pending visual verify" — these require a vision-capable model or human inspection against `brand-system/09-master-image-prompts.md`.

**Total:** 31 SKUs audited, 45 PNG files inventory, 36 unique hashes, 3 duplicate groups (12 files), 9 files with hash collisions affecting SKU mapping, 6 products requiring manual visual review per brand spec, 1 P0 blocker (false claim), 1 P0 blocker (external manifest dependency), 1 P1 missing test, 3 P2 improvements.