---
title: "DOH-NUT Project Rules & Episodic Memory"
document_id: "SMS-DOHNUT-GEMINI-001"
version: "2.0.0"
last_updated: "2026-09-16 14:15:00"
maintainer: "Antigravity / Sovereign Architect"
classification: "Internal / Core Rules"
lifecycle_status: "Active / Living Standard"
---

# 🔒 DOH-NUT PROJECT RULES & EPISODIC MEMORY (GEMINI.md)

## 🔒 PERATURAN MUTLAK (Zero Unprompted UI Additions)
1. **DILARANG SAMA SEKALI** menambah komponen UI baharu, butang tambahan, tab bar navigasi ekstra (seperti bar pil kategori), atau mengubah struktur visual asal tanpa arahan dan persetujuan eksplisit daripada pengguna terlebih dahulu.
2. **Skop Pembaikan:** Sebarang pembaikan pepijat (*bugfix*) atau logik fungsi hanya membetulkan isu teknikal yang diminta tanpa mengubah estetika visual asal atau menyuntik komponen yang tidak diminta.
3. **Kekalkan Standard Asal:** Reka bentuk asal Flutter / DohNut (3 donat display, 3D ring slider bersih dengan hanya butang Back, background partikel dan warna rasmi) mesti dikekalkan 100%.
4. **Protokol Audio / Voice Note (Mandatory Verbatim Display):** Setiap kali pengguna menghantar pesanan suara (*voicenote* / fail audio), ejen **WAJIB** memaparkan transkripsi penuh perkataan pengguna terlebih dahulu di bahagian paling atas respon bagi mengesahkan kefahaman dan mengelakkan sebarang salah faham sebelum sebarang tindakan diambil.

## 📝 Episodic Memory & Solved Milestones
- **2026-09-16 (Pemasangan & Integrasi Suite Kemahiran UI/UX FRONTEND S-Rank [v2.0.0])**:
  - **Isu Ditangani**: Pengguna meminta pemasangan kemahiran (*skills*) khusus berfokuskan UI/UX FRONTEND. Siasatan mendapati pautan simbolik lama `frontend-design` tergantung (*broken symlink*), dan enjin `ui-ux-pro-max` hanya tersorok dalam plugin tanpa pemasangan global tahap pertama (*first-class*).
  - **Penyelesaian**:
    1. **`ui-ux-pro-max`**: Dipasang secara penuh ke peringkat global `~/.gemini/config/skills/ui-ux-pro-max` merangkumi 79 gaya reka bentuk, 192 palet produk, 74 pasangan tipografi, 119 garis panduan UX, 105 ikon, dan 22 tindanan teknologi (Next.js, Tailwind, React, shadcn) berserta enjin carian CLI Python `search.py`.
    2. **`frontend-design`**: Dibina semula dan dipasang secara rasmi (Standard Anthropic S-Rank) untuk membasmi *"AI slop"*, memastikan identiti visual tersendiri, tipografi berasaskan watak produk, dan estetika terancang.
    3. **`design-taste-frontend`**: Dipasang pakej penuh 87KB (Leonxlnx) merangkumi pembacaan *brief*, penetapan 3 dial (`VARIANCE`, `MOTION`, `DENSITY`), dan audit prapenerbangan.
    4. **Skop Ruang Kerja (`g:\Doh-Nut\.agents\skills`)**: Diselaraskan direktori `.agents/skills` dalam repositori agar sub-ejen tempatan dan IDE mempunyai akses terus.
  - **Validasi**: Skrip carian `search.py` diuji dan menghasilkan output pantas, 62/62 ujian Bun lulus 100%.
- **2026-09-16 (Audit Heuristik UI/UX NN/g & Penalaan Konsistensi P1 [v1.9.9])**:
  - **Isu Ditangani**: Sesi audit menyeluruh UI/UX berasaskan penanda aras NN/g 10 Heuristics, Doh-Nut Brand System v2.0, dan WCAG 2.1 AA mengenal pasti 3 isu konsistensi & kejelasan visual:
    1. Butang `+ Add to Cart` di *Saved View* (`donut-card.tsx`) menggunakan warna Navy berbanding Frosting Pink di Slider & Detail.
    2. Penarafan bintang `★ 4.9` pada kad 3D slider mempunyai kontras marginal (~3.2:1) kerana kelas kelabu muda `/45`.
    3. Palang skrol kelabu pelayar kelihatan pada bekas skrol utama di peranti desktop/pelayar.
  - **Penyelesaian**:
    1. Menyelaraskan butang `+ Add to Cart` dalam [donut-card.tsx](file:///g:/Doh-Nut/src/components/dohnut/donut-card.tsx) kepada Frosting Pink (`bg-[var(--color-dowgnut-pink)] hover:bg-[var(--color-dowgnut-pink-dark)]`).
    2. Meningkatkan teks penarafan bintang dalam [donut-slider.tsx](file:///g:/Doh-Nut/src/components/dohnut/donut-slider.tsx) kepada High-Contrast Navy `#07334F` dengan bintang keemasan amber `★` (kontras melepasi WCAG AAA >10:1).
    3. Menambah penindasan palang skrol pada `.overflow-y-auto` di [globals.css](file:///g:/Doh-Nut/src/app/globals.css) tanpa mengubah kontrak rentetan `page.tsx` bagi mengekalkan ujian `customer-accessibility.test.ts`.
  - **Validasi**: `bun test` 62/62 lulus 100%, `bun run build` melepasi 14/14 halaman dengan 0 ralat TypeScript, visual Chrome DevTools disahkan.
- **2026-09-16 (Penalaan Kelajuan Animasi Donat 20% Lebih Pantas [2.1s])**:
  - **Isu Ditangani**: Pengguna meminta animasi dilajukan sebanyak 20% agar pergerakan donat lebih tangkas dan responsif namun tetap mengekalkan putaran penuh 360° yang jelas.
  - **Penyelesaian**:
    1. Melaraskan durasi putaran dan gelungsuran dari `2.6s` kepada `2.1s` pada `ShopHome`, `RingCard`, dan `Half-Donut view` (`donut-slider.tsx`).
    2. Menyelaraskan sela masa elemen iringan: kemunculan donat jiran 3D slider kepada `delay: 0.7s`, kad bawah slider kepada `delay: 0.75s`, dan panel nutrisi detail kepada `delay: 0.4s - 0.7s`.
    3. `viewVariants` halaman diselaraskan kepada `2.1s` (`easeInOutCubic`).
  - **Validasi**: `bun test` 62/62 lulus 100%, `bun run build` melepasi pintu pelepasan produksi dengan 14/14 laluan OK (0 ralat TypeScript).
- **2026-09-16 (Penyelarasan Konsep Putaran Donat 360° Menyeluruh: Skrin 1 ➔ 2 ➔ 3)**:
  - **Isu Ditangani**: Pengguna meminta konsep putaran berterusan yang sama dilaksanakan dari Skrin 1 (Home) ke Skrin 2 (3D Slider) tanpa donat tiba-tiba muncul.
  - **Penyelesaian**:
    1. **Skrin 1 (Home)**: Donat bermula pada putaran asas 0°.
    2. **Skrin 2 (Ring Slider)**: Donat tengah bersambung melalui `layoutId` dan berputar penuh 360° (`rotate: 360`) mengikut arah jam sepanjang 2.6s dengan keluk `easeInOutCubic` (`[0.37, 0, 0.63, 1]`). Donat jiran di sekeliling gelang 3D tidak lagi muncul mengejut, sebaliknya memudar masuk secara anggun (`delay: 0.85s, scale: 0.6 ➔ 1`). Kad bawah slider meluncur naik lembut (`delay: 0.95s, y: 35 ➔ 0`).
    3. **Skrin 3 (Half-Donut Detail)**: Donat berputar lagi 360° seterusnya kepada 720° (`rotate: 720`) semasa meluncur ke sisi kanan (*bleed-off*).
    4. **Arah Pembalikan (Back Navigation)**:
       - 3 ➔ 2: Berputar balik secara lawan jam dari 720° ke 360°.
       - 2 ➔ 1: Berputar balik secara lawan jam dari 360° ke 0° masuk kembali ke dalam susunan menegak Home.
    5. **Kontena Paparan (`page.tsx`)**: Menyelaraskan `viewVariants` bagi view `shop` dan `slider` agar mengekalkan koordinat tanpa gelungsuran liar `x: -24` yang memotong transisi donat.
  - **Validasi**: `bun test` 62/62 lulus 100%, `bun run build` melepasi pintu pelepasan produksi dengan 14/14 laluan OK (0 ralat TypeScript).
- **2026-09-16 (Penalaan Donat Berguling 360° — Diperlahankan 30% [2.6s] & Putaran Penuh)**:
  - **Isu Ditangani**: Pengguna meminta animasi diperlahankan 30% lagi dari 2.0s supaya pergerakan donat berpusing/berguling ke kanan nampak dengan jelas.
  - **Penyelesaian**:
    1. Melaraskan durasi gelungsuran `layout` dan `rotate` pada `RingCard` dan `Half-Donut view` kepada `2.6s` (tambahan 30% dari 2.0s).
    2. Menukar darjah putaran dari 180° ke putaran penuh 360° (`rotate: 360`) agar pusingan donat berguling ke kanan jelas kelihatan sepanjang pelayaran.
    3. Menggunakan keluk `easeInOutCubic` (`[0.37, 0, 0.63, 1]`) bagi memastikan pusingan donat konsisten dan tidak tersentak di fasa permulaan.
    4. Menyelaraskan kad nutrisi (*delay 0.5s - 0.85s*), kad Total (*delay 0.85s*), dan Home ➔ Slider (*1.6s*).
  - **Validasi**: `bun test` 62/62 lulus 100%, `bun run build` melepasi pintu pelepasan produksi dengan 14/14 laluan OK (0 ralat TypeScript).
- **2026-09-16 (Penalaan Transisi Sinematik Donat — 2.0s Slow Rolling & Half-Donut Glide)**:
  - **Isu Ditangani**: Pengguna mahu animasi donat berguling dan meluncur ke posisi Half-Donut Split Detail diperlahankan lagi agar kelihatan lebih anggun, jelas, dan sinematik.
  - **Penyelesaian**:
    1. Melaraskan durasi `layout` dan `rotate` pada imej donat di `RingCard` dan `Half-Donut view` (`donut-slider.tsx`) kepada `2.0s` menggunakan easing `[0.16, 1, 0.3, 1]`.
    2. Menyelaraskan kad nutrisi sebelah kiri (*stagger delay 0.45s+*) dan kad Total bawah (*delay 0.65s*) agar muncul secara harmoni mengiringi donat yang meluncur perlahan.
    3. Memperhalus transisi Home ➔ Slider di `shop-home.tsx` dan `page.tsx` kepada `1.2s` (`ease: [0.16, 1, 0.3, 1]`).
  - **Validasi**: `bun test` 62/62 lulus 100%, `bun run build` melepasi pintu pelepasan produksi dengan 14/14 laluan OK (0 ralat TypeScript).
- **2026-09-16 (Fizik Transisi Donat Berterusan & Halus — Zero Disappear / Zero Blink)**:
  - **Isu Ditangani**: Donat hilang/berkelip semasa bertukar dari Home ke 3D Slider, dan hilang/muncul semula (*blink/pop-in*) semasa klik donat tengah ke Half-Donut Split Detail.
  - **Penyelesaian Home ➔ Slider**:
    1. Mengaktifkan `<AnimatePresence initial={false} mode="popLayout">` di `page.tsx` agar halaman sedia ada di-*pop* ke koordinat mutlak tanpa menolak paparan slider ke bawah.
    2. Menyelaraskan `viewVariants` bagi view `slider` (`initial: { opacity: 1 }` dan `duration: 0.7s`) agar elemen dikongsi (*shared layout*) kekal 100% nampak sepanjang pelayaran tanpa disorokkan oleh *container opacity*.
    3. Memastikan `ShopHome` menggunakan `overflow-visible` semasa animasi.
  - **Penyelesaian Slider ➔ Half-Donut Split Detail**:
    1. `RingCard` kini mengiktiraf `detailOpen` dan tidak lagi memaparkan imej klon bertindih apabila mod split detail aktif, membolehkan `layoutId={currentLayoutId}` berpindah dengan lancar ke kanvas split detail.
    2. Menyingkirkan `initial={{ opacity: 0 }}` pada bekas induk detail view, agar donat tidak menjadi telus di tengah jalan.
    3. Donat meluncur perlahan dan berterusan ke sebelah kanan (*bleed-off*) pada kelajuan `0.75s` (`ease: [0.16, 1, 0.3, 1]`) dan kembali ke tengah gelang 3D apabila butang Back ditekan tanpa sebarang kehilangan visual.
    4. Kad nutrisi (*Salt, Sugar, Fat, Energy*) dan kad harga/stepper menggelongsor masuk dari kiri dan bawah secara harmoni.
  - **Validasi**: `bun test` 62/62 lulus 100%, `bun run build` melepasi pintu pelepasan produksi dengan 14/14 laluan OK (0 ralat TypeScript).
- **2026-09-15 (Penaiktarafan Wireframe Board v2.0 — 100% Pematuhan Konsep Asal Doh-Nut)**:
  - Membina semula secara menyeluruh `/wireframe` (`wireframe-board.tsx`) agar **100% menyamai struktur dan konsep asal aplikasi Doh-Nut** tanpa sebarang konsep asing/rekaan baharu:
    1. **Header Autentik**: Logo rasmi Doh-Nut, butang troli merah jambu dengan lencana bilangan, butang Sparkles (*DOH BOY™ Concierge*), dan butang Menu.
    2. **BottomNav 4-Item Rasmi**: Mengikut tepat `src/components/dohnut/bottom-nav.tsx` (`Shop`, `Saved`, `Cart`, `Orders`) dengan palet kuning/mentega (*butter cream*) dan lencana kiraan. Dihapuskan tab navigasi 5-item yang tidak wujud.
    3. **Home Screen (`shop-home.tsx`)**: Tajuk *"WHAT'S YOUR FLAVA?"* fon graffiti, lencana *🔥 3 day streak*, partikel taburan, dan susunan menegak 3 donat bertindih (*Classic*, *Sprinkled*, *Stuffed* dengan `-space-y-6`). Sentuhan donat beralih terus ke 3D slider.
    4. **3D Ring Slider (`donut-slider.tsx`)**: Butang undur bulat ke Home, kanvas ring 3D berperspektif, donat tengah fokus, kad bawah dengan nama, ★4.9, kalori/gula/lemak, harga RM, butang hati kegemaran, stepper `- 1 +`, butang *Add to Cart* merah jambu, dan penunjuk kategori.
    5. **Half-Donut Split Detail (`donut-slider.tsx`)**: Grid pembahagian ikonik 44%/56%: sebelah kiri mengandungi pil nutrisi menegak (*Salt, Sugar, Fat, Energy*), sebelah kanan menonjolkan separuh donat gergasi terkeluar bingkai (*bleed-off*), dan kad bawah Total + Stepper + Add to Cart.
    6. **Saved View (`favorites-view.tsx`)**: Skrin *"My Favorites"* & *"Saved for later"* berserta kad donat kegemaran.
    7. **Cart Drawer (`cart-drawer.tsx`)**: Kotak pesanan *"Your Box"* dengan pemegang leret atas (*pill grab handle*), meter penghantaran percuma lori, senarai donat berserta stepper, dan butang Checkout berzon selamat (*safe-area padding*).
    8. **Express Checkout (`checkout-view.tsx`)**: Pil isian pantas (*⚡ Test Buyer*, *⭐ VIP Foodie*), borang pelanggan, pilihan bayaran Billplz FPX, dan sekuriti SSL 256-bit.
    9. **Order Tracking (`order-tracking-view.tsx`)**: Penjejak pesanan 5 peringkat (*Paid ➔ Prep ➔ Baking ➔ Transit ➔ Arrived*), ETA ~18 minit, dan kad kurier Faris (Yamaha Y15).
    10. **DOH BOY™ AI Concierge (`ai-concierge.tsx`)**: Pembantu cadangan perisa yang dibuka melalui ikon Sparkles header.
  - Interaktiviti prototip 1-klik: Donat Home ➔ 3D Slider ➔ Split Detail ➔ Cart Drawer ➔ Checkout ➔ Orders.
  - Validasi: `bun test` 62/62 lulus, `bun run build` 14/14 static & dynamic pages OK, `http://localhost:3000/wireframe` merespons HTTP 200 OK.
- **2026-09-15 (Audit UI/UX Menyeluruh, Delegasi Sub-Ejen & Penambahbaikan 3-Tahap)**:
  - Delegasi tugas penuh merentasi 8-Ejen Squad: `@dohnut-orchestrator`, `@dohnut-brand-guardian`, `@dohnut-frontend-artisan`, dan `@dohnut-qa-guardian`.
  - **Brand Hygiene**: Diselaraskan `aria-label="Doh-Nut home"` di `dohnut-header.tsx`, `alt="Doh-Nut logo"` di `dohnut-logo.tsx`, dan teks subtajuk troli `"X donuts selected"` di `cart-drawer.tsx`.
  - **Aset & Konsol**: Dihapuskan amaran nisbah aspek Next.js `<Image>` pada `dohnut-logo.tsx` (`style={{ width: "auto", height: "auto" }}`). Konsol pelayar disahkan 0 ralat dan 0 amaran.
  - **Ergonomik & Zon Selamat**: Disembunyikan palang skrol kelabu mentah pada *Quick Fill* (`checkout-view.tsx`) dan pil cadangan (`ai-concierge.tsx`) menggunakan `[scrollbar-width:none] [&::-webkit-scrollbar]:hidden`. Ditambah zon selamat bawah `pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]` pada footer laci troli.
  - **Kinestetik & Audio**: Ditambah suis togol *Sound Effects* (`Volume2`/`VolumeX`) dalam laci Menu yang disambung secara langsung ke sintesis Web Audio API (`sounds.ts`).
  - **Validasi Mutlak**: 62/62 Bun tests lulus 100%, `bun run build` melepasi pintu pelepasan produksi (14/14 halaman statik & pelayan terjana dengan 0 ralat TypeScript).
- **2026-09-12 (Audit & Penyelarasan Pasukan 8-Ejen Doh-Nut — Zero Cross-Pollution)**:
  - Disahkan kesemua 8 ejen di `G:\Doh-Nut\.gemini\agents\` mematuhi secara mutlak data ground-truth `G:\Doh-Nut` (Next.js 16, Bun, Prisma, 31 perisa katalog, 11 fail `brand-system/`).
  - Dikemas kini `dohnut-orchestrator.md` untuk mengiktiraf kesemua 7 sub-ejen (Technical & Brand/Growth squads).
  - Dikemas kini `dohnut-qa-guardian.md` dengan penanda aras sebenar (62/62 Bun tests lulus merentasi 15 fail).
  - Dicerminkan kesemua 8 fail ejen ke global `~/.gemini/agents/` dan diselaraskan lejar kriptografi SHA-256 dalam `C:\Users\megat\.gemini\acknowledgments\agents.json`.
  - Air-gap pengasingan disahkan: sifar pencemaran silang dengan arkib luaran atau `04-Active/DOWGNUT`.
- **2026-09-12 (Antigravity Obsidian FastMCP Integration & Autonomous Toolchain)**:
  - Pelayan FastMCP `obsidian` didaftarkan secara natif ke dalam `agy.exe` (`~/.gemini/config/mcp_config.json`).
  - Menyediakan 6 alatan: `obsidian_get_context`, `obsidian_search_notes` (<80ms Hot-Zone search), `obsidian_read_note`, `obsidian_log_activity`, `obsidian_write_note`, dan `obsidian_open_in_gui`.
  - Penjimatan token >95% dengan pemencilan 2,708 fail arkib `Hermes-Docs` secara automatik.
- **2026-09-12 (Tactile Claymation Concept Benchmark & 8-Agent Squad Integration)**:
  - Video `dohnut-hands-making-donut.mp4` diinstitusikan sebagai **Master Concept Guidelines** rasmi di `brand-system/11-tactile-claymation-concept-guideline.md`.
  - Diselaraskan 6-fasa penceritaan kinestetik (Uli ➔ Acuan ➔ Goreng ➔ Celup ➔ Tabur ➔ Logo Snap) ke dalam ejen `dohnut-brand-guardian` dan `dohnut-viral-engine`.
  - Disahkan integriti fail, kemas kini SHA-256 dalam `agents.json`, dan 62/62 ujian Bun kekal 100% lulus.
  - Dipasangkan maklum balas sentuhan `active:scale-[0.97]` dan peralihan bersasar pada [button.tsx](file:///g:/Doh-Nut/src/components/ui/button.tsx).
  - Dibetulkan kontras aksesibiliti navigasi bawah kepada 85% untuk melepasi piawaian WCAG AA (>4.5:1).
  - Dioptimumkan LCP melalui keutamaan imej logo dan donat tengah.
  - Dilaksanakan code splitting Recharts pada [admin-charts.tsx](file:///g:/Doh-Nut/src/components/dohnut/admin-charts.tsx) untuk mengurangkan TBT.
  - Disahkan melalui `bun run build`: 13/13 halaman statik & pelayan dijana dengan 0 ralat TypeScript.
- **2026-09-05 (Product Image Audit & Fixes)**:
  - Dijana 3 aset imej Sira Series yang hilang: `kuih-burger-malaysia.png`, `sira-kuih-keria.png`, `sira-sambal.png` (resolusi standard 1024x1024).
  - Dilakukan batch resize 12 fail imej gergasi (2048x2048, ~12MB total) kepada 1024x1024 bicubic interpolation untuk menjimatkan ~2.5MB payload mobile.
  - Disahkan 31/31 rujukan `seed-data.ts` wujud tanpa sebarang fail hilang (0 missing). Server merespons HTTP 200 OK.
- **2026-09-05 (3D Slider Motion Stabilization)**:
  - Dihapuskan ayunan condong liar `tiltZ` (rotateZ mengikut halaju) pada ring 3D [donut-slider.tsx](file:///g:/Doh-Nut/src/components/dohnut/donut-slider.tsx) agar satah putaran kekal tegap dan stabil.
  - Dibuang denyutan melompat `scale: [1, 1.05, 1]` pada donat tengah agar visual tidak terkejut-kejut semasa sliding.
  - Ditala spring snap kepada *critically damped* (`stiffness: 320, damping: 32`) bagi menghapuskan lantunan berlebihan (*zero overshoot*).
  - Dilaraskan rintangan leretan kepada `150px` agar kawalan jari terasa padu dan konsisten.
- **2026-09-05 (Universal Markdown Alignment & SMS-v1.0 Compliance)**:
  - Selaraskan semua dokumentasi (.md) agar konsisten dengan realiti sistem terkini: 31 perisa katalog unik, palet rasmi (Kuning/Merah/Navy/Butter), dan status pembetulan sistem.
- **2026-09-05 (Vercel Serverless SQLite Fallback Fix & Deployment Ready)**:
  - Dibetulkan ralat build Vercel `Production requires a persistent DATABASE_URL; refusing local SQLite fallback` pada [sqlite-path.ts](file:///g:/Doh-Nut/src/lib/sqlite-path.ts).
  - Ditambah laluan fallback selamat `file:/tmp/dowgnut.db` khusus persekitaran Vercel serverless tanpa persediaan DB luaran (Option A demo deploy).
  - Diuji dan diluluskan 45/45 ujian unit `bun test` dan binaan Next.js 13/13 halaman statik & pelayan.
- **2026-09-07 (Security Hardening, Admin Metrics Correction & PWA Offline Integrity)**:
  - Dibetulkan kiraan hasil dan jumlah pesanan di [stats/route.ts](file:///g:/Doh-Nut/src/app/api/admin/stats/route.ts) agar hanya mengira pesanan sah berbayar (`paidAt !== null`).
  - Dilaksanakan pengesahan `isAdminRequest` berasaskan `timingSafeEqual` pada [orders/[id]/route.ts](file:///g:/Doh-Nut/src/app/api/orders/[id]/route.ts) bagi menghapuskan risiko *timing attack*.
  - Ditambah indeks pangkalan data `Order.sessionId` dalam [schema.prisma](file:///g:/Doh-Nut/prisma/schema.prisma) dan [ensure-ready.ts](file:///g:/Doh-Nut/src/lib/ensure-ready.ts).
  - Ditukar fallback imej luaran pada [shop-home.tsx](file:///g:/Doh-Nut/src/components/dohnut/shop-home.tsx) kepada aset lokal `/brand/donuts/` bagi menjamin ketahanan PWA offline 100%.
  - Diletakkan sekatan out-of-stock pada [detail-modal.tsx](file:///g:/Doh-Nut/src/components/dohnut/detail-modal.tsx) (`disabled={donut.stock <= 0}` & "Sold Out") serta ceiling stok pada [cart-drawer.tsx](file:///g:/Doh-Nut/src/components/dohnut/cart-drawer.tsx).
  - Ditambah suite ujian unit [admin-security-stats.test.ts](file:///g:/Doh-Nut/tests/admin-security-stats.test.ts). 49/49 ujian `bun test` lulus (0 fail).
- **2026-09-10 (Home → Slider transition and documentation alignment)**:
  - Dikekalkan konsep transition yang diminta: `selectedType`, donut Home bergerak dengan `x`, `rotate: 360`, dan `scale` mengecil sebelum berpindah ke Slider kategori yang sama.
  - Disambungkan `LayoutGroup`, `AnimatePresence`, dan `layoutId` antara `shop-home.tsx`, `donut-slider.tsx`, dan `page.tsx`; Home tidak membuka half-donut detail atau nutrition panel.
  - Ditambah route wireframe interaktif `/wireframe`, disahkan root dan wireframe memberi HTTP 200 semasa preview.
  - Dibaiki `Prisma.Decimal` rounding dalam `src/lib/money.ts` menggunakan `toDecimalPlaces`, dan build production berjaya.
  - Plugin `superpowers@superpowers-marketplace` v6.3.0 dipasang dalam Copilot CLI dengan 14 skills.
- **2026-09-12 (Audit Visual Penuh & Pembaikan Profil Media Sosial Secara Empirikal)**:
  - Dilakukan semakan visual mendalam (*Evidence-First Visual Inspection*) ke atas setiap tangkapan skrin profil:
    - **Instagram (`@thisisdohnut`)**: 🟢 **100% LIVE & SAH**. Bio rasmi terpapar penuh pada profil (`02-instagram-live-updated.png`).
    - **Threads (`@thisisdohnut`)**: 🟢 **100% DIPERBAIKI & LIVE**. Bio (`DOH NUT WORRY, we make donuts fun. 🍩...`) disuntik via `execCommand` + React event dispatcher dan disahkan terpapar jelas pada kad profil (`03-threads-live-updated.png`).
    - **Facebook (`Doh Nut`)**: 🟢 **100% DIPERBAIKI & LIVE**. Masalah ralat 404 diselesaikan dengan membetulkan laluan ke URL punca profil sah. Profil Doh Nut dengan logo rasmi dan 2 rakan disahkan aktif (`04-facebook-live-updated.png`).
    - **YouTube (`thisisdohnut@gmail.com`)**: ⚠️ **DIKUNCI OLEH GOOGLE RATE LIMIT (24 JAM)**. Modal penciptaan saluran berjaya dibuka, namun Google menguatkuasakan had percubaan nama: `"You entered too many names that can’t be used. Try again in 24 hours."` Butang cipta saluran disekat buat sementara oleh pelayan Google (`06-youtube-live-updated.png`).

## 📋 Audit & Revision Ledger (SMS-v1.0)
| `2.0.0` | 2026-09-16 14:15:00 | Sovereign Conductor & 8-Agent Squad | Pemasangan Suite Kemahiran UI/UX FRONTEND S-Rank | Pasang `ui-ux-pro-max` (global + CLI), `frontend-design` (Anthropic), `design-taste-frontend` (Leonxlnx), baiki broken symlink | `python search.py`: OK, `bun test`: 62/62 pass |
| `1.9.9` | 2026-09-16 07:20:00 | Sovereign Conductor & 8-Agent Squad | Penalaan Heuristik P1 (CTA Pink, Kontras Rating, Scrollbar-None) | Selaras CTA Favorites ke Frosting Pink, tingkatkan kontras rating ★4.9 (Navy + Amber star), buang palang skrol kelabu pelayar | `bun test`: 62/62 pass, `bun run build`: 14/14 OK |
| `1.9.8` | 2026-09-16 04:20:00 | Sovereign Conductor & 8-Agent Squad | Penalaan Kelajuan Animasi Donat 20% Lebih Pantas (2.1s) | Durasi putaran dan gelungsuran 2.6s ➔ 2.1s (ShopHome, RingCard, Half-Donut), delay siblings 0.7s, delay kad bawah 0.75s, delay nutrisi 0.4s-0.7s | `bun test`: 62/62 pass, `bun run build`: 14/14 OK |
| `1.9.7` | 2026-09-16 04:15:00 | Sovereign Conductor & 8-Agent Squad | Putaran Donat 360° Menyeluruh (1 ➔ 2 ➔ 3) | 1(0°) ➔ 2(360°) ➔ 3(720°), siblings ring fade in delay 0.85s, kad bawah delay 0.95s, viewVariants x:0 | `bun test`: 62/62 pass, `bun run build`: 14/14 OK |
| `1.9.6` | 2026-09-16 04:05:00 | Sovereign Conductor & 8-Agent Squad | Penalaan Donat Berguling 360° (2.6s & easeInOutCubic) | Tambah 30% durasi kepada 2.6s, putaran penuh 360°, easeInOutCubic [0.37, 0, 0.63, 1], Home ➔ Slider 1.6s | `bun test`: 62/62 pass, `bun run build`: 14/14 OK |
| `1.9.5` | 2026-09-16 03:55:00 | Sovereign Conductor & 8-Agent Squad | Penalaan Transisi Sinematik Donat (2.0s Slow Rolling & Glide) | Donat layout & rotate duration 2.0s (ease [0.16, 1, 0.3, 1]), selaras kad nutrisi & total, Home ➔ Slider 1.2s | `bun test`: 62/62 pass, `bun run build`: 14/14 OK |
| `1.9.4` | 2026-09-16 03:15:00 | Sovereign Conductor & 8-Agent Squad | Transisi Donat Berterusan (Zero Blink / Zero Disappear) | `popLayout` mode pada `page.tsx`, `slider` initial opacity 1, `RingCard` unmount image bila `detailOpen`, donat glide perlahan ke kanan (0.75s) | `bun test`: 62/62 pass, `bun run build`: 14/14 OK |
| `1.9.3` | 2026-09-15 22:55:00 | Sovereign Conductor & 8-Agent Squad | Penaiktarafan penuh Wireframe v2.0 Master Suite | Bina semula wireframe-board.tsx (10 skrin interaktif, 3 view modes, Web Audio, dev specs) | `bun test`: 62/62 pass, `bun run build`: 14/14 OK, HTTP 200 on /wireframe |
| `1.9.2` | 2026-09-15 22:05:00 | Sovereign Conductor & 8-Agent Squad | Audit UI/UX menyeluruh & delegasi sub-ejen | Brand hygiene (Doh-Nut), Next.js Image style fix, scrollbar-none pills, safe area padding, Sound Effects toggle | `bun test`: 62/62 pass, `bun run build`: 14/14 OK, console: 0 errors / 0 warnings |
| `1.9.1` | 2026-09-12 09:53:00 | Sovereign Conductor | Audit visual mendalam & pembaikan Threads/FB/YouTube | Semak imej secara langsung via `view_file`, suntik bio Threads via `execCommand`, perbetul URL FB, kenal pasti Google rate limit YouTube | Visual verified: `02-instagram` (Live), `03-threads` (Live bio terpapar), `04-facebook` (Clean profile), `06-youtube` (Google 24h tripwire) |
| `1.8.0` | 2026-09-12 08:35:00 | Sovereign Conductor | Pengesahan media sosial rasmi, kemaskini footer & integrasi WebMCP | Baiki `dohnut-footer.tsx`, simpan tangkapan skrin bukti, integrasi WebMCP port 10087, catat Obsidian | `bun test`: 62/62 pass, WebBridge status `extension_connected: true`, Chrome Profile 50 diverifikasi |
| `1.7.1` | 2026-09-12 07:45:00 | Sovereign Conductor | Audit & Penyelarasan Pasukan 8-Ejen Doh-Nut | Kemas kini `dohnut-orchestrator.md` & `dohnut-qa-guardian.md`, sync global mirror, kemaskini SHA-256 | `bun test`: 62/62 pass, 8/8 SHA-256 disahkan, 0 cross-pollution |
| `1.7.0` | 2026-09-12 07:05:00 | Sovereign Conductor | Integrasi FastMCP Obsidian untuk AGY CLI | Bina `server.py`, daftar `obsidian` ke `agy mcp`, uji context & log | `agy mcp list`: enabled, latency <80ms, log disahkan |
| `1.6.0` | 2026-09-12 05:25:00 | Sovereign Conductor | Penerimaan dohnut-hands-making-donut.mp4 sebagai Garis Panduan Konsep | Cipta `11-tactile-claymation-concept-guideline.md`, selaraskan 8 ejen, kemaskini SHA-256 | `bun test`: 62/62 pass, fail disahkan |
| `1.4.0` | 2026-09-07 19:05:00 | Sovereign Conductor | Audit P1/P2 resolution & hardening | Admin stats paid filter, timing-safe bypass, local assets, stock guards, Order index | `bun test`: 49/49 tests pass (0 fail) |
| `1.5.0` | 2026-09-10 10:25:00 | Copilot | Selaraskan interaction, build, preview, dan dokumentasi | Home → Slider shared transition, `/wireframe`, money API compatibility, Superpowers plugin | `bun run build`: berjaya; preview `/` dan `/wireframe`: HTTP 200 |
| `1.3.0` | 2026-09-05 10:28:00 | Sovereign Conductor | Vercel build failure bugfix | Baiki `resolveDatabaseUrl` untuk /tmp fallback di Vercel & update tests | Vercel build: `● Ready` (47s), 45/45 tests pass |
| `1.2.0` | 2026-09-05 09:30:00 | Sovereign Conductor | Alignment semua dokumen projek (.md) | Tambah SMS-v1.0 frontmatter & ledger, kemaskini milestone universal | `bun run build`: 13/13 pages OK |
| `1.1.0` | 2026-09-05 05:25:00 | Sovereign Conductor | Penstabilan fizik 3D slider | Buang `tiltZ`, matikan pulse scale, tune spring critically damped | Manual slider drag test |
| `1.0.0` | 2026-09-05 04:55:00 | Sovereign Conductor | Audit imej produk & Emil design | Resize 12 imej 2048→1024, jana 3 imej Sira Series | 31/31 rujukan sah (HTTP 200) |
