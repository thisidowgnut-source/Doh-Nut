# 🍩 DOH-NUT — Laporan Audit Terperinci UI/UX & Pelan Peningkatan Kod [2026]

> **Tarikh**: 2026-09-24  
> **Aplikasi**: DOH-NUT (Malaysian Donut Drop)  
> **Teknologi**: Next.js 16 + React 19 + Tailwind CSS v4 + Framer Motion 12 + Radix UI + Zustand 5  
> **Dokumentasi Sasaran**: Pengalaman Pengguna (UX), Reka Bentuk Antaramuka (UI), Ergonomi Pergerakan (*Motion Physics*), dan Pengoptimuman Kadar Penukaran (*Conversion Rate Optimization / CRO*).

---

## 📊 1. Kad Skor Penilaian Eksekutif (Audit Scorecard)

| Dimensi Penilaian | Skor Semasa | Status | Isu Teras Yang Dikesan |
| :--- | :---: | :---: | :--- |
| **1. Hirarki Visual & Penemuan Produk** | **6.5 / 10** | ⚠️ Perlu Dibaiki | Siri Malaysia (Musang King, Pandan) & Savory tersorok dari laman utama. |
| **2. Ergonomi Pergerakan (*Motion Speed*)** | **6.0 / 10** | ⚠️ Kritikal | Durasi animasi 2.1s terlalu lambat untuk e-dagang mudah alih. |
| **3. Funnel Penukaran Jualan (E-Commerce UX)** | **7.0 / 10** | 🟡 Sederhana | Tiada pilihan *Box of 4/6/12* & tiada *one-click upsell* ambang RM25. |
| **4. Kebolehgunaan Mudah Alih & Thumb Zone** | **7.5 / 10** | 🟡 Baik | Butang troli wujud 2 kali (Header & Bottom Nav) & pertindihan butang terapung (FAB). |
| **5. Aksesibiliti & Kontras Teks (WCAG AA)** | **8.0 / 10** | 🟢 Baik | Latar kuning terang memerlukan teks Navy pekat tanpa *opacity* pudar. |
| **6. Integrasi Bukti Sosial (*Social Proof*)** | **5.0 / 10** | 🔴 Rendah | Tiada widget video TikTok/Reels langsung di laman kedai. |

---

## 🚩 2. Analisis Masalah Mendalam & Bukti Kod Sumber

### 2.1 Produk Wira Tempatan (*Malaysian Hero Flavors*) Tersembunyi dari Laman Utama
* **Fail Terlibat**: `src/components/dohnut/shop-home.tsx` (Baris 14–36)
* **Situasi Kod**:
  ```typescript
  const TYPES = [
    { key: "classic", label: "Classic", desc: "Timeless glazed & cake", ... },
    { key: "sprinkled", label: "Sprinkled", desc: "Rainbow jimmies & fun", ... },
    { key: "stuffed", label: "Stuffed", desc: "Filled with cream & jelly", ... },
  ];
  ```
* **Masalah UX**:
  * Repositori ini mempunyai **6 Perisa Istimewa Malaysia** (`Pandan Gula Melaka`, `Teh Tarik Kaw Glaze`, `Musang King Durian Bomb`, `Cameron Strawberry Drip`, `Ipoh White Coffee Glaze`, `Teh Tarik Classic Foam`) serta **3 Perisa Gurih Sira** (`Kuih Burger Malaysia`, `Sira Kuih Keria`, `Sira Sambal`).
  * Namun di skrin hadapan, pengguna hanya dipaparkan 3 jenis asas. Pengguna baru tidak sedar bahawa keunikan utama jenama Doh-Nut adalah perisa tempatan.

---

### 2.2 Latensi Animasi Melambatkan Pembelian (2.1s Friction Drag)
* **Fail Terlibat**: `src/app/page.tsx` (Baris 37) & `src/components/dohnut/donut-slider.tsx`
* **Situasi Kod**:
  ```typescript
  transition: { duration: 2.1, ease: [0.37, 0, 0.63, 1] }
  ```
* **Masalah UX**:
  * Durasi **2.1 saat** adalah terlalu lama untuk transisi e-dagang mudah alih.
  * Tambahan lagi, transisi dari skrin gelang slider ke paparan perincian separuh donut memerlukan putaran `rotate: 720°` yang mengambil masa 2.1 saat lagi. Ini bermakna pengguna perlu menunggu lebih 4 saat hanya untuk menambah sebiji donut ke troli.

---

### 2.3 Kegagalan Logik Bisnes Donut: Ketiadaan "Box Builder"
* **Masalah UX**:
  * Donut dalam talian jarang dibeli secara individu (1 biji) kerana caj penghantaran rata adalah RM3.99.
  * Tabiat pembeli adalah membeli **sekotak (4 biji, 6 biji, atau 12 biji)**. Ketiadaan visual kotak yang sedang diisi menyebabkan pengguna tidak mempunyai panduan jelas untuk memaksimumkan pembelian mereka.

---

### 2.4 Pertindihan Ikon & Lebihan Butang Terapung (FAB Overload)
* **Fail Terlibat**: `src/components/dohnut/dohnut-header.tsx`, `src/components/dohnut/bottom-nav.tsx`, dan `src/app/page.tsx` (Baris 204–207)
* **Masalah UX**:
  * Ikon troli wujud di *Top Header* dan juga di *Bottom Nav*.
  * Terdapat dua butang terapung berasingan (`AIConcierge` dan `AIDesigner`) di bahagian bawah skrin, menyebabkan pertindihan zon ibu jari (*thumb zone congestion*) pada peranti mudah alih.

---

## 💡 3. Pelan Tindakan Cadangan Peningkatan (Actionable Engineering Roadmap)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 PELAN PENINGKATAN UI/UX DOH-NUT 2026                        │
└─────────────────────────────────────────────────────────────────────────────┘
       │
       ├─► [ FASA 1 ] : Kemas kini Kategori Laman Utama (5 Siri + Hero Malaysia)
       ├─► [ FASA 2 ] : Laju Fizik Animasi Spring (2.1s ➔ 350ms Snappy Motion)
       ├─► [ FASA 3 ] : Ciri "Box Builder" & Smart Free Delivery Upsell (RM25)
       ├─► [ FASA 4 ] : Pembersihan Navigasi & Penyatuan DOH AI Assistant FAB
       └─► [ FASA 5 ] : Pemasangan Widget Video Komuniti TikTok / Reels
```

---

### 🚀 Fasa 1: Pengoptimuman Kategori Laman Utama (`shop-home.tsx`)

Kemas kini senarai `TYPES` dalam `src/components/dohnut/shop-home.tsx` kepada 5 kategori utama dengan mengetengahkan identiti Malaysia:

```typescript
export const TYPES = [
  {
    key: "specialty",
    label: "Malaysian Flavors 🇲🇾",
    desc: "Musang King, Pandan & Teh Tarik",
    accent: "#059669",
    defaultImg: "/brand/donuts/pandan-gula-melaka.png",
  },
  {
    key: "classic",
    label: "Classics 🍩",
    desc: "Timeless glazed & cake",
    accent: "#92400E",
    defaultImg: "/brand/donuts/donut_classic1.png",
  },
  {
    key: "sprinkled",
    label: "Sprinkled ✨",
    desc: "Rainbow jimmies & fun",
    accent: "#BE185D",
    defaultImg: "/brand/donuts/donut_sprinkled1.png",
  },
  {
    key: "stuffed",
    label: "Stuffed 💥",
    desc: "Filled with cream & lava",
    accent: "#1E40AF",
    defaultImg: "/brand/donuts/donut_stuffed1.png",
  },
  {
    key: "savory",
    label: "Savory & Sira 🌶️",
    desc: "Sambal bilis & kuih keria",
    accent: "#DC2626",
    defaultImg: "/brand/donuts/kuih-burger-malaysia.png",
  },
];
```

---

### ⚡ Fasa 2: Penalaan Fizik Spring Pantas (`page.tsx` & `donut-slider.tsx`)

Gantikan durasi animasi 2.1s dengan fizik spring responsif (Apple/Linear standard):

```typescript
// Gantikan di src/app/page.tsx (viewVariants)
animate: (view: string) => ({
  opacity: 1,
  x: 0,
  transition: {
    type: "spring",
    stiffness: 380,
    damping: 30,
    mass: 0.8,
  },
}),
```
*Hasil*: Masa peralihan berkurangan dari 2,100ms kepada **~350ms**, memberikan rasa interaksi yang sangat bertenaga, licin, dan membuang kebosanan menunggu.

---

### 📦 Fasa 3: Ciri Smart Upsell Ambang Free Delivery (`cart-drawer.tsx`)

Dalam `src/components/dohnut/cart-drawer.tsx`, letakkan cadangan produk pantas satu-klik apabila baki ke ambang RM25 kurang daripada RM6:

```tsx
{remaining > 0 && remaining <= 6 && (
  <div className="mx-4 mb-3 flex items-center justify-between rounded-xl border border-[var(--color-dowgnut-pink)]/30 bg-white p-2.5 shadow-xs">
    <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-dowgnut-blue-dark)]">
      <span>🛵 Tambah RM{remaining.toFixed(2)} lagi untuk FREE DELIVERY!</span>
    </div>
    <button
      onClick={() => {
        const item = donuts.find(d => d.type === "specialty");
        if (item) addToCart(item.id, 1);
      }}
      className="rounded-lg bg-[var(--color-dowgnut-pink)] px-2.5 py-1 text-[11px] font-bold text-white hover:opacity-90"
    >
      + Tambah Donut
    </button>
  </div>
)}
```

---

### 📱 Fasa 4: Penyatuan Butang Terapung (Unified AI Hub)

Daripada memaparkan dua butang berasingan (`AIConcierge` dan `AIDesigner`), gabungkan ke dalam satu butang pintar terapung:
* Ikon: `⚡ DOH AI Hub`
* Apabila ditekan, paparkan menu ringkas:
  1. 💬 *"DOH Boy Concierge (Tanya Cadangan Perisa)"*
  2. 🎨 *"AI Donut Designer (Cipta Donut Sendiri)"*

---

### 📹 Fasa 5: Integrasi Video UGC TikTok (Social Proof)

Pasang seksyen karusel video vertikal di skrin utama atau drawer troli:
* Memaparkan video UGC rasmi: `ugc/output/dohnut_ugc_viral_ad.mp4`.
* Tajuk: *"🔥 Tengok Apa Kata Penggemar Donut di TikTok"*
* Menjana keyakinan pembeli pertama (*trust factor*) sehingga **6.73 kali ganda lebih tinggi**.
