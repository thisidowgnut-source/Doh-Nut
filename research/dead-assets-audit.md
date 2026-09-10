# 📦 Doh-Nut Public Media Assets & Dead Code Audit

**Document ID**: `AUDIT-ASSETS-DOHNUT-001`  
**Tarikh Audit**: `2026-09-07`  
**Penyiasat**: `Asset & Storage Optimization Engineer (Sovereign Swarm)`  
**Status**: `Completed / Non-Destructive Inventory`

---

## 📊 1. Ringkasan Eksekutif

| Kategori | Jumlah Fail | Saiz Anggaran | Status |
| :--- | :---: | :---: | :--- |
| **Aset Aktif (Catalog + Brand UI)** | 39 fail | ~4.5 MB | **Aktif Digunakan (Kekal)** |
| **Aset Mati (Unreferenced Media)** | 17 fail | **~21.8 MB** | **Calon Arkib / Pembersihan** |
| **Jumlah Keseluruhan (public/)** | 56 fail | ~26.3 MB | - |

> [!NOTE]
> Menyingkirkan atau mengarkibkan 17 fail mati ini akan menjimatkan **~83% daripada keseluruhan saiz folder `public/`**, mempercepatkan masa `git clone`, instalasi Docker, dan `vercel build` deployment.

---

## 🟢 2. Senarai Aset Aktif (31 Donat Katalog + UI Asas)

Semua fail berikut dirujuk secara sah oleh `src/lib/seed-data.ts`, `src/components/dohnut/shop-home.tsx`, `layout.tsx`, atau PWA web manifest:

### A. Donat Katalog (31 Perisa)
1. `/brand/donuts/donut_classic1.png` (107 KB) - Classic Glazed
2. `/brand/donuts/donut_classic2.png` (115 KB) - Chocolate Cake Classic
3. `/brand/donuts/donut_classic3.png` (93 KB) - Maple Glaze Ring
4. `/brand/donuts/donut_classic4.png` (143 KB) - Powdered Sugar Donut
5. `/brand/donuts/donut_classic5.png` (143 KB) - Cinnamon Sugar Twist
6. `/brand/donuts/donut_classic6.png` (110 KB) - Old-Fashioned Sour Cream
7. `/brand/donuts/toasted-coconut.png` (148 KB) - Toasted Coconut Crunch
8. `/brand/donuts/donut_classic8.png` (121 KB) - Honey Dip Ring
9. `/brand/donuts/donut_sprinkled1.png` (139 KB) - Rainbow Birthday Cake
10. `/brand/donuts/donut_sprinkled3.png` (140 KB) - Chocolate Sprinkle Bomb
11. `/brand/donuts/donut_sprinkled4.png` (124 KB) - Strawberry Funfetti
12. `/brand/donuts/donut_sprinkled2.png` (138 KB) - Vanilla Bean Confetti
13. `/brand/donuts/confetti-fiesta.png` (111 KB) - Confetti Fiesta
14. `/brand/donuts/matcha-white-choco.png` (76 KB) - Uji Matcha White Choco
15. `/brand/donuts/donut_stuffed1.png` (130 KB) - Boston Cream Dream
16. `/brand/donuts/donut_stuffed2.png` (109 KB) - Raspberry Jam Jelly
17. `/brand/donuts/donut_stuffed3.png` (108 KB) - Nutella Hazelnut Bomb
18. `/brand/donuts/donut_stuffed4.png` (130 KB) - Bavarian Custard Silk
19. `/brand/donuts/donut_stuffed5.png` (105 KB) - Lemon Curd Zing
20. `/brand/donuts/donut_stuffed6.png` (113 KB) - Salted Caramel Molten
21. `/brand/donuts/blueberry-cheesecake.png` (930 KB) - Blueberry Cheesecake Bomb
22. `/brand/donuts/donut_stuffed8.png` (116 KB) - Apple Pie Cinnamon Stuffed
23. `/brand/donuts/pandan-gula-melaka.png` (94 KB) - Pandan Gula Melaka
24. `/brand/donuts/teh-tarik-kaw.png` (95 KB) - Teh Tarik Kaw Glaze
25. `/brand/donuts/musang-king-durian.png` (112 KB) - Musang King Durian Bomb
26. `/brand/donuts/donut_classic7.png` (87 KB) - Cameron Strawberry Glaze
27. `/brand/donuts/ipoh-white-coffee.png` (126 KB) - Ipoh White Coffee Creme
28. `/brand/donuts/teh-tarik-foam.png` (99 KB) - Teh Tarik Sea-Salt Foam
29. `/brand/donuts/kuih-burger-malaysia.png` (670 KB) - Kuih Burger Malaysia Sambal
30. `/brand/donuts/sira-kuih-keria.png` (722 KB) - Sira Gula Melaka Kuih Keria
31. `/brand/donuts/sira-sambal.png` (820 KB) - Sira Sambal Bilis Crispy

### B. Logo, Ikon, & PWA Core
- `brand/dohnut-logo-wordmark.png` (433 KB)
- `brand/app-icon-192.png`, `brand/app-icon-512.png`
- `brand/app-icon-maskable-192.png`, `brand/app-icon-maskable-512.png`
- `brand/hero-mobile.png`, `brand/hero-banner.png`
- `brand/promo-1.png`, `brand/promo-2.png`, `brand/hypebeast-icon.png`
- `favicon-new.png`, `apple-touch-icon.png`, `favicon.ico`, `manifest.json`, `sw.js`

---

## 🔴 3. Senarai Aset Mati (Dead / Unreferenced Assets: ~21.8 MB)

Fail-fail ini ditinggalkan daripada fasa penstrukturan imej lama (imej kartun duplikasi dan video komersial lama) dan TIDAK dirujuk oleh mana-mana komponen dalam `src/`:

| Path Fail | Saiz Fail | Punca Tidak Digunakan |
| :--- | :---: | :--- |
| `public/brand/donuts/chocolate-classic.png` | 1.04 MB | Diganti oleh fotorealistik `donut_classic2.png` |
| `public/brand/donuts/chocolate-sprinkle.png` | 1.04 MB | Diganti oleh `donut_sprinkled3.png` |
| `public/brand/donuts/durian-cream.png` | 1.04 MB | Diganti oleh `musang-king-durian.png` |
| `public/brand/donuts/kopi-classic.png` | 946 KB | Diganti oleh `ipoh-white-coffee.png` |
| `public/brand/donuts/matcha-classic.png` | 760 KB | Kartun lama duplikasi |
| `public/brand/donuts/matcha-sprinkle.png` | 760 KB | Kartun lama duplikasi |
| `public/brand/donuts/pandan-matcha.png` | 760 KB | Kartun lama duplikasi |
| `public/brand/donuts/strawberry-classic.png` | 760 KB | Diganti oleh `donut_classic7.png` |
| `public/brand/donuts/strawberry-drip.png` | 760 KB | Kartun lama duplikasi |
| `public/brand/donuts/strawberry-stuffed.png` | 760 KB | Kartun lama duplikasi |
| `public/brand/donuts/teh-tarik-classic.png` | 946 KB | Diganti oleh `teh-tarik-kaw.png` |
| `public/brand/donuts/teh-tarik.png` | 946 KB | Diganti oleh `teh-tarik-foam.png` |
| `public/brand/donuts/donut_sprinkled5.png` | 135 KB | Lebihan varian tidak didaftarkan dalam 31 katalog |
| `public/brand/donuts/donut_stuffed7.png` | 129 KB | Diganti oleh `blueberry-cheesecake.png` |
| `public/brand/hero/hero-blue.png` | 2.11 MB | Aset desktop promo lama |
| `public/brand/hero/hero-pink.png` | 1.84 MB | Aset desktop promo lama |
| `public/videos/dohnut-commercial.mp4` | 4.09 MB | Video komersial lama tidak di-mount di page.tsx |
| `public/videos/commercial-result.json` | 1 KB | Metadata video tidak digunakan |
| **JUMLAH POTENSI PENJIMATAN** | **~21.8 MB** | **17 Fail** |

---

## 🛡️ 4. Pelan Pembersihan Selamat (Safe Migration Protocol)

Bagi mengelakkan sebarang risiko kehilangan fail secara tidak sengaja:
1. Pindahkan fail di atas ke folder arkib `_ARCHIVED/public-dead-assets/` (jangan `rm` terus).
2. Uji binaan `bun run build` dan pastikan tiada rujukan 404 pada network tab.
3. Masukkan `_ARCHIVED/` ke dalam `.gitignore` jika mahu menjimatkan saiz repositori git.
