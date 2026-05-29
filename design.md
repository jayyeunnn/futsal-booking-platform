# UI/UX Design Document
# JayField — Website Booking Lapangan Futsal

---

## 1. Design System

### 1.1 Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#1B5E20` | Dark Green — headers, nav, primary buttons |
| `primary-light` | `#2E7D32` | Hover states, secondary elements |
| `secondary` | `#212121` | Almost Black — text, dark sections |
| `accent` | `#4CAF50` | Vibrant Green — highlights, badges, success |
| `cta` | `#FF6D00` | Orange — call-to-action buttons, important actions |
| `cta-hover` | `#E65100` | Darker orange — CTA hover state |
| `background` | `#FAFAFA` | Off-white — page background |
| `surface` | `#FFFFFF` | White — cards, modals, forms |
| `muted` | `#F5F5F5` | Light gray — alternate sections |
| `border` | `#E0E0E0` | Borders, dividers |
| `text-primary` | `#1A1A1A` | Main text |
| `text-secondary` | `#616161` | Secondary/muted text |
| `text-inverse` | `#FFFFFF` | Text on dark backgrounds |
| `success` | `#4CAF50` | Success states |
| `warning` | `#FF9800` | Warning states |
| `error` | `#F44336` | Error states |
| `info` | `#2196F3` | Info states |


### 1.2 Typography

| Element | Font | Weight | Size (Desktop) | Size (Mobile) |
|---------|------|--------|----------------|---------------|
| H1 | Montserrat | Bold (700) | 48px / 3rem | 32px / 2rem |
| H2 | Montserrat | Bold (700) | 36px / 2.25rem | 28px / 1.75rem |
| H3 | Montserrat | SemiBold (600) | 28px / 1.75rem | 22px / 1.375rem |
| H4 | Montserrat | SemiBold (600) | 22px / 1.375rem | 18px / 1.125rem |
| Body Large | Inter | Regular (400) | 18px / 1.125rem | 16px / 1rem |
| Body | Inter | Regular (400) | 16px / 1rem | 14px / 0.875rem |
| Body Small | Inter | Regular (400) | 14px / 0.875rem | 12px / 0.75rem |
| Caption | Inter | Medium (500) | 12px / 0.75rem | 11px / 0.6875rem |
| Button | Inter | SemiBold (600) | 16px / 1rem | 14px / 0.875rem |
| Nav Link | Inter | Medium (500) | 16px / 1rem | 14px / 0.875rem |

### 1.3 Spacing Scale

```
4px  (0.25rem) — xs
8px  (0.5rem)  — sm
12px (0.75rem) — md
16px (1rem)    — base
24px (1.5rem)  — lg
32px (2rem)    — xl
48px (3rem)    — 2xl
64px (4rem)    — 3xl
96px (6rem)    — 4xl (section padding)
```

### 1.4 Border Radius

| Element | Radius |
|---------|--------|
| Buttons | 8px (rounded-lg) |
| Cards | 12px (rounded-xl) |
| Modals | 16px (rounded-2xl) |
| Inputs | 8px (rounded-lg) |
| Badges/Tags | 9999px (rounded-full) |
| Images | 12px (rounded-xl) |


### 1.5 Shadows

| Level | CSS | Usage |
|-------|-----|-------|
| sm | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation (inputs) |
| md | `0 4px 6px rgba(0,0,0,0.07)` | Cards, dropdowns |
| lg | `0 10px 15px rgba(0,0,0,0.1)` | Modals, popovers |
| xl | `0 20px 25px rgba(0,0,0,0.15)` | Hero overlay, floating elements |

### 1.6 Breakpoints

| Name | Min Width | Target |
|------|-----------|--------|
| `sm` | 640px | Large phones (landscape) |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Large screens |

### 1.7 Component Styles

#### Buttons

| Variant | Background | Text | Border | Usage |
|---------|-----------|------|--------|-------|
| Primary | `#1B5E20` | White | None | General primary actions |
| CTA | `#FF6D00` | White | None | "Book Sekarang", key conversions |
| Secondary | Transparent | `#1B5E20` | 2px `#1B5E20` | Secondary actions |
| Ghost | Transparent | `#616161` | None | Tertiary actions, nav links |
| Destructive | `#F44336` | White | None | Delete, cancel actions |

**Button Sizes:**
- `sm`: h-9, px-3, text-sm
- `md`: h-11, px-5, text-base (default)
- `lg`: h-13, px-8, text-lg (hero CTA)

#### Cards

```
┌─────────────────────────────────┐
│  Background: #FFFFFF             │
│  Border: 1px solid #E0E0E0      │
│  Border-radius: 12px            │
│  Shadow: md                      │
│  Padding: 24px                   │
│  Hover: shadow-lg + translateY(-2px) │
└─────────────────────────────────┘
```


---

## 2. Layout & Navigation

### 2.1 Navbar (Public)

```
┌──────────────────────────────────────────────────────────────┐
│  [Logo JayField]     Beranda  Lokasi  Promo  FAQ  [ID|EN]    │
│                                            [Login] [Book Now] │
└──────────────────────────────────────────────────────────────┘

Mobile (hamburger):
┌──────────────────────────────────────┐
│  [Logo]                    [☰] Menu  │
└──────────────────────────────────────┘
  Slide-in drawer:
  ┌────────────────┐
  │  Beranda       │
  │  Lokasi        │
  │  Promo         │
  │  FAQ           │
  │  ─────────────│
  │  Login         │
  │  [Book Now]    │
  │  [ID] [EN]     │
  └────────────────┘
```

**Navbar behavior:**
- Fixed top (sticky)
- Background: transparent on hero, white + shadow on scroll
- Height: 72px desktop, 60px mobile

### 2.2 Navbar (Authenticated User)

```
┌──────────────────────────────────────────────────────────────┐
│  [Logo]     Beranda  Lokasi  Promo  FAQ  [ID|EN]             │
│                                    [🔔 3] [Avatar ▼] [Book]  │
└──────────────────────────────────────────────────────────────┘

Avatar dropdown:
┌─────────────────────┐
│  👤 Nama User       │
│  ⭐ Gold Member     │
│  ──────────────────│
│  📋 Dashboard       │
│  📅 Booking Saya    │
│  🏆 Membership      │
│  ⚙️  Profil         │
│  ──────────────────│
│  🚪 Logout          │
└─────────────────────┘
```

### 2.3 Footer

```
┌──────────────────────────────────────────────────────────────┐
│  Background: #212121 (secondary/dark)                         │
│                                                               │
│  [Logo JayField]        NAVIGASI        KONTAK               │
│  Tagline singkat        • Beranda       📍 Alamat             │
│                         • Lokasi        📞 Telepon            │
│  [FB] [IG] [TikTok]    • Booking       ✉️  Email             │
│                         • FAQ                                 │
│                         • Promo         JAM OPERASIONAL       │
│                                         🕐 08:00 - 00:00      │
│                                                               │
│  ─────────────────────────────────────────────────────────── │
│  © 2026 JayField. All rights reserved.  Privacy | Terms      │
└──────────────────────────────────────────────────────────────┘
```


---

## 3. Page Wireframes

### 3.1 Landing Page

```
┌══════════════════════════════════════════════════════════════┐
│                        NAVBAR (transparent)                   │
├══════════════════════════════════════════════════════════════┤
│                                                              │
│              ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░              │
│              ░░░  HERO SECTION (Full Width)  ░░░              │
│              ░░░                             ░░░              │
│              ░░░  Background: Foto lapangan  ░░░              │
│              ░░░  + dark overlay (60%)       ░░░              │
│              ░░░                             ░░░              │
│              ░░░  H1: "Booking Lapangan      ░░░              │
│              ░░░       Futsal Jadi Lebih     ░░░              │
│              ░░░       Mudah"                ░░░              │
│              ░░░                             ░░░              │
│              ░░░  Subtitle: "Pilih, pesan,   ░░░              │
│              ░░░  dan main. Semudah itu."    ░░░              │
│              ░░░                             ░░░              │
│              ░░░  [🟠 BOOK SEKARANG]         ░░░              │
│              ░░░  [○ Lihat Lokasi]           ░░░              │
│              ░░░                             ░░░              │
│              ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░              │
│              Height: 100vh (full screen)                      │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ── SOCIAL PROOF BAR ──────────────────────────────────────  │
│  Background: #1B5E20 (primary)                               │
│                                                              │
│    🏟️ 10+ Lapangan    👥 5000+ Booking    ⭐ 4.8 Rating      │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ── SECTION: INFO LAPANGAN & FASILITAS ────────────────────  │
│  Background: #FAFAFA                                         │
│                                                              │
│  H2: "Lapangan Kami"                                         │
│  Subtitle: "Pilih lapangan sesuai kebutuhan Anda"            │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐                           │
│  │  🏢 INDOOR  │  │  🌤️ OUTDOOR │                           │
│  │  [Foto]     │  │  [Foto]     │                           │
│  │  Rumput     │  │  Rumput     │                           │
│  │  Sintetis   │  │  Sintetis   │                           │
│  │             │  │             │                           │
│  │  ✓ AC      │  │  ✓ Luas    │                           │
│  │  ✓ Terang  │  │  ✓ Segar   │                           │
│  │  ✓ Anti    │  │  ✓ Natural │                           │
│  │    hujan   │  │    light   │                           │
│  └─────────────┘  └─────────────┘                           │
│                                                              │
│  FASILITAS:                                                  │
│  [🅿️ Parkir] [🕌 Mushola] [🍔 Kantin] [🚿 Shower]           │
│  [👕 Ruang Ganti] [📶 WiFi] [🏪 Mini Mart]                  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ── SECTION: LOKASI ───────────────────────────────────────  │
│  Background: #FFFFFF                                         │
│                                                              │
│  H2: "Lokasi Kami"                                           │
│  Subtitle: "Tersebar di berbagai area strategis"             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           [Google Maps Embed / Static Map]           │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ 📍 Lokasi A │  │ 📍 Lokasi B │  │ 📍 Lokasi C │        │
│  │ Alamat...   │  │ Alamat...   │  │ Alamat...   │        │
│  │ 3 Lapangan  │  │ 5 Lapangan  │  │ 2 Lapangan  │        │
│  │ [Lihat →]   │  │ [Lihat →]   │  │ [Lihat →]   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                              │
├──────────────────────────────────────────────────────────────┤

│                                                              │
│  ── SECTION: HARGA ────────────────────────────────────────  │
│  Background: #FAFAFA                                         │
│                                                              │
│  H2: "Harga Sewa"                                            │
│  Subtitle: "Transparan dan terjangkau"                       │
│                                                              │
│  [Tab: Weekday] [Tab: Weekend]                               │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Waktu          │  Indoor      │  Outdoor          │     │
│  ├────────────────────────────────────────────────────┤     │
│  │  Regular        │              │                   │     │
│  │  08:00 - 16:00  │  Rp 150.000  │  Rp 120.000      │     │
│  ├────────────────────────────────────────────────────┤     │
│  │  Prime Time     │              │                   │     │
│  │  16:00 - 00:00  │  Rp 250.000  │  Rp 200.000      │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  * Harga per jam. Member dapat diskon hingga 20%             │
│  [🟠 Book Sekarang]                                          │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ── SECTION: GALLERY ──────────────────────────────────────  │
│  Background: #FFFFFF                                         │
│                                                              │
│  H2: "Gallery"                                               │
│                                                              │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                       │
│  │ Foto │ │ Foto │ │ Foto │ │ Foto │                       │
│  │  1   │ │  2   │ │  3   │ │  4   │                       │
│  └──────┘ └──────┘ └──────┘ └──────┘                       │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                       │
│  │ Foto │ │ Foto │ │ Foto │ │ Foto │                       │
│  │  5   │ │  6   │ │  7   │ │  8   │                       │
│  └──────┘ └──────┘ └──────┘ └──────┘                       │
│                                                              │
│  Grid: 4 cols desktop, 2 cols mobile                         │
│  Lightbox on click                                           │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ── SECTION: PROMO & EVENT ────────────────────────────────  │
│  Background: #FAFAFA                                         │
│                                                              │
│  H2: "Promo & Event"                                         │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ [Banner Image]   │  │ [Banner Image]   │                 │
│  │                  │  │                  │                 │
│  │ 🔥 Weekend Deal  │  │ 🏆 Turnamen Mei  │                 │
│  │ Diskon 30%       │  │ Total Hadiah     │                 │
│  │ Booking Sabtu-   │  │ Rp 10.000.000   │                 │
│  │ Minggu           │  │                  │                 │
│  │                  │  │                  │                 │
│  │ [Lihat Detail]   │  │ [Daftar →]       │                 │
│  └──────────────────┘  └──────────────────┘                 │
│                                                              │
│  Carousel on mobile (swipe)                                  │
│                                                              │
├──────────────────────────────────────────────────────────────┤

│                                                              │
│  ── SECTION: TESTIMONI ────────────────────────────────────  │
│  Background: #FFFFFF                                         │
│                                                              │
│  H2: "Apa Kata Mereka"                                       │
│                                                              │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐     │
│  │ ⭐⭐⭐⭐⭐       │ │ ⭐⭐⭐⭐⭐       │ │ ⭐⭐⭐⭐⭐       │     │
│  │               │ │               │ │               │     │
│  │ "Lapangannya  │ │ "Booking      │ │ "Harga murah  │     │
│  │  bagus, bersih│ │  online gak   │ │  lapangan     │     │
│  │  dan terawat" │ │  ribet!"      │ │  bagus!"      │     │
│  │               │ │               │ │               │     │
│  │ 👤 Ahmad R.   │ │ 👤 Budi S.    │ │ 👤 Doni P.    │     │
│  │ Gold Member   │ │ Silver Member │ │ Member        │     │
│  └───────────────┘ └───────────────┘ └───────────────┘     │
│                                                              │
│  Carousel with auto-scroll + dots pagination                 │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ── SECTION: FAQ ──────────────────────────────────────────  │
│  Background: #FAFAFA                                         │
│                                                              │
│  H2: "Pertanyaan Umum"                                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ▸ Bagaimana cara booking lapangan?                   │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  ▸ Berapa DP yang harus dibayar?                      │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  ▸ Bisakah membatalkan booking?                       │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  ▸ Apa keuntungan jadi member?                        │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  ▸ Jam operasional lapangan?                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Accordion style — klik untuk expand jawaban                 │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ── SECTION: CTA FINAL ────────────────────────────────────  │
│  Background: gradient #1B5E20 → #2E7D32                      │
│                                                              │
│  H2: "Siap Main Futsal?"                                     │
│  Subtitle: "Booking sekarang, lapangan menunggu Anda"        │
│                                                              │
│  [🟠 BOOK SEKARANG]   [○ Daftar Gratis]                     │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                          FOOTER                              │
└══════════════════════════════════════════════════════════════┘
```


---

### 3.2 Authentication Pages

#### Login Page

```
┌══════════════════════════════════════════════════════════════┐
│                          NAVBAR                              │
├══════════════════════════════════════════════════════════════┤
│                                                              │
│         ┌────────────────────────────────────┐              │
│         │          [Logo JayField]            │              │
│         │                                    │              │
│         │    H3: "Masuk ke Akun Anda"        │              │
│         │    Subtitle: "Selamat datang       │              │
│         │    kembali!"                        │              │
│         │                                    │              │
│         │    [🟡 Login dengan Google]         │              │
│         │                                    │              │
│         │    ────── atau ──────              │              │
│         │                                    │              │
│         │    Email                           │              │
│         │    ┌──────────────────────────┐   │              │
│         │    │  email@example.com       │   │              │
│         │    └──────────────────────────┘   │              │
│         │                                    │              │
│         │    Password                        │              │
│         │    ┌──────────────────────────┐   │              │
│         │    │  ••••••••         [👁️]    │   │              │
│         │    └──────────────────────────┘   │              │
│         │                                    │              │
│         │    [Lupa Password?]                │              │
│         │                                    │              │
│         │    [🟢 MASUK — full width]         │              │
│         │                                    │              │
│         │    Belum punya akun? [Daftar]      │              │
│         └────────────────────────────────────┘              │
│                                                              │
│         Card: max-width 440px, centered                      │
│         Background page: muted #F5F5F5                       │
│                                                              │
└══════════════════════════════════════════════════════════════┘
```

#### Register Page

```
┌────────────────────────────────────┐
│          [Logo JayField]            │
│                                    │
│    H3: "Buat Akun Baru"            │
│    Subtitle: "Gratis & jadi member │
│    langsung!"                       │
│                                    │
│    [🟡 Daftar dengan Google]        │
│                                    │
│    ────── atau ──────              │
│                                    │
│    Nama Lengkap                    │
│    ┌──────────────────────────┐   │
│    │  John Doe                 │   │
│    └──────────────────────────┘   │
│                                    │
│    Email                           │
│    ┌──────────────────────────┐   │
│    │  email@example.com       │   │
│    └──────────────────────────┘   │
│                                    │
│    No. WhatsApp                    │
│    ┌──────────────────────────┐   │
│    │  +62 812 xxxx xxxx       │   │
│    └──────────────────────────┘   │
│                                    │
│    Password                        │
│    ┌──────────────────────────┐   │
│    │  ••••••••         [👁️]    │   │
│    └──────────────────────────┘   │
│    Strength: [████░░░░] Medium    │
│                                    │
│    Konfirmasi Password             │
│    ┌──────────────────────────┐   │
│    │  ••••••••                 │   │
│    └──────────────────────────┘   │
│                                    │
│    [✓] Saya setuju dengan          │
│        Terms & Privacy Policy      │
│                                    │
│    [🟢 DAFTAR SEKARANG]            │
│                                    │
│    Sudah punya akun? [Masuk]       │
└────────────────────────────────────┘
```


---

### 3.3 Booking Flow Pages

#### Step 1: Pilih Lokasi

```
┌══════════════════════════════════════════════════════════════┐
│                          NAVBAR                              │
├══════════════════════════════════════════════════════════════┤
│                                                              │
│  ── BREADCRUMB ──                                            │
│  Booking > Pilih Lokasi                                      │
│                                                              │
│  H2: "Pilih Lokasi"                                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  🔍 Cari lokasi...                    [Filter ▼]      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ [📷 Foto]  Lokasi A — Jl. Sudirman No. 10          │    │
│  │            🏟️ 5 Lapangan (3 Indoor, 2 Outdoor)      │    │
│  │            🕐 08:00 - 00:00                          │    │
│  │            📍 Jakarta Selatan                        │    │
│  │            ⭐ 4.8 (120 reviews)                      │    │
│  │                                        [Pilih →]    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ [📷 Foto]  Lokasi B — Jl. Gatot Subroto No. 22     │    │
│  │            🏟️ 3 Lapangan (2 Indoor, 1 Outdoor)      │    │
│  │            🕐 08:00 - 00:00                          │    │
│  │            📍 Jakarta Pusat                          │    │
│  │            ⭐ 4.6 (85 reviews)                       │    │
│  │                                        [Pilih →]    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└══════════════════════════════════════════════════════════════┘
```

#### Step 2: Pilih Lapangan

```
┌══════════════════════════════════════════════════════════════┐
│  Booking > Lokasi A > Pilih Lapangan                         │
│                                                              │
│  H2: "Pilih Lapangan — Lokasi A"                             │
│                                                              │
│  [Tab: Semua] [Tab: Indoor] [Tab: Outdoor]                   │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ [📷 Foto]   │  │ [📷 Foto]   │  │ [📷 Foto]   │        │
│  │             │  │             │  │             │        │
│  │ Lapangan 1  │  │ Lapangan 2  │  │ Lapangan 3  │        │
│  │ 🏢 Indoor   │  │ 🏢 Indoor   │  │ 🌤️ Outdoor  │        │
│  │ Vinyl       │  │ Sintetis    │  │ Sintetis    │        │
│  │             │  │             │  │             │        │
│  │ Mulai dari  │  │ Mulai dari  │  │ Mulai dari  │        │
│  │ Rp 150.000  │  │ Rp 150.000  │  │ Rp 120.000  │        │
│  │ /jam        │  │ /jam        │  │ /jam        │        │
│  │             │  │             │  │             │        │
│  │ [🟠 Pilih]  │  │ [🟠 Pilih]  │  │ [🟠 Pilih]  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                              │
│  Grid: 3 cols desktop, 2 cols tablet, 1 col mobile           │
└══════════════════════════════════════════════════════════════┘
```

#### Step 3: Pilih Jadwal (Calendar View)

```
┌══════════════════════════════════════════════════════════════┐
│  Booking > Lokasi A > Lapangan 1 > Pilih Jadwal             │
│                                                              │
│  H2: "Pilih Jadwal"                                          │
│  Info: Lapangan 1 — Indoor — Vinyl                           │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  [◄]     MEI 2026    [►]                             │   │
│  │                                                      │   │
│  │  Sen  Sel  Rab  Kam  Jum  Sab  Min                   │   │
│  │  25   26   27   [28]  29   30   31                   │   │
│  │                  ^^^selected                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Jadwal untuk: Rabu, 28 Mei 2026                             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  08:00  [🟢 Tersedia    — Rp 150.000]  [Pilih]       │   │
│  │  09:00  [🟢 Tersedia    — Rp 150.000]  [Pilih]       │   │
│  │  10:00  [🟡 Pending     — —         ]  [—    ]       │   │
│  │  11:00  [🟢 Tersedia    — Rp 150.000]  [Pilih]       │   │
│  │  ...                                                  │   │
│  │  16:00  [🟢 Tersedia    — Rp 250.000]  [Pilih]       │   │
│  │  17:00  [🔴 Terbooked   — —         ]  [—    ]       │   │
│  │  18:00  [🔴 Terbooked   — —         ]  [—    ]       │   │
│  │  19:00  [🟢 Tersedia    — Rp 250.000]  [Pilih]       │   │
│  │  20:00  [🟢 Tersedia    — Rp 250.000]  [Pilih]       │   │
│  │  21:00  [🟢 Tersedia    — Rp 250.000]  [Pilih]       │   │
│  │  22:00  [🟢 Tersedia    — Rp 250.000]  [Pilih]       │   │
│  │  23:00  [🟢 Tersedia    — Rp 250.000]  [Pilih]       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Legend: 🟢 Tersedia  🟡 Pending  🔴 Terbooked               │
│                                                              │
│  ── SELECTED SLOTS ──                                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ✓ 19:00 - 20:00  │  Rp 250.000  │  [✕ Hapus]      │   │
│  │  ✓ 20:00 - 21:00  │  Rp 250.000  │  [✕ Hapus]      │   │
│  │  ─────────────────────────────────────────────────── │   │
│  │  Total: 2 jam  │  Rp 500.000                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  [☐ Jadikan booking berulang (setiap minggu)]                │
│                                                              │
│  [🟠 LANJUT KE PEMBAYARAN →]                                 │
│                                                              │
└══════════════════════════════════════════════════════════════┘
```


#### Step 4: Konfirmasi & Pembayaran

```
┌══════════════════════════════════════════════════════════════┐
│  Booking > Konfirmasi & Pembayaran                           │
│                                                              │
│  ┌─── LEFT PANEL (60%) ───────────────────────────────────┐ │
│  │                                                         │ │
│  │  H3: "Detail Booking"                                   │ │
│  │                                                         │ │
│  │  📍 Lokasi: Lokasi A — Jl. Sudirman No. 10             │ │
│  │  🏟️ Lapangan: Lapangan 1 (Indoor, Vinyl)               │ │
│  │  📅 Tanggal: Rabu, 28 Mei 2026                         │ │
│  │  🕐 Waktu: 19:00 - 21:00 (2 jam)                       │ │
│  │  🔄 Recurring: Setiap Rabu (opsional)                   │ │
│  │                                                         │ │
│  │  ─────────────────────────────────────────────────      │ │
│  │                                                         │ │
│  │  H3: "Pilih Tipe Pembayaran"                            │ │
│  │                                                         │ │
│  │  ┌────────────────────┐ ┌────────────────────┐         │ │
│  │  │ ◉ DP (50%)        │ │ ○ Bayar Full       │         │ │
│  │  │   Rp 250.000      │ │   Rp 500.000      │         │ │
│  │  │   Bayar sisa di   │ │   Tidak perlu     │         │ │
│  │  │   tempat           │ │   bayar lagi     │         │ │
│  │  └────────────────────┘ └────────────────────┘         │ │
│  │                                                         │ │
│  │  ─────────────────────────────────────────────────      │ │
│  │                                                         │ │
│  │  H3: "Pilih Metode Pembayaran"                          │ │
│  │                                                         │ │
│  │  BANK TRANSFER:                                         │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │ │
│  │  │  [BCA]  │ │  [BNI]  │ │[Mandiri]│ │  [BRI]  │     │ │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘     │ │
│  │                                                         │ │
│  │  E-WALLET:                                              │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐                  │ │
│  │  │  [Dana] │ │  [OVO]  │ │ [GoPay] │                  │ │
│  │  └─────────┘ └─────────┘ └─────────┘                  │ │
│  │                                                         │ │
│  │  Kode Promo (opsional):                                 │ │
│  │  ┌──────────────────────┐ [Gunakan]                    │ │
│  │  │  PROMO2026           │                               │ │
│  │  └──────────────────────┘                               │ │
│  │  ✓ Promo berhasil! Diskon 10%                           │ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─── RIGHT PANEL (40%) — Sticky ─────────────────────────┐ │
│  │                                                         │ │
│  │  ┌─────────────────────────────────────────────┐       │ │
│  │  │  H4: "Ringkasan Pembayaran"                 │       │ │
│  │  │                                             │       │ │
│  │  │  Subtotal (2 jam)        Rp 500.000         │       │ │
│  │  │  Diskon member (10%)    -Rp  50.000         │       │ │
│  │  │  Promo PROMO2026 (10%) -Rp  45.000         │       │ │
│  │  │  ──────────────────────────────────         │       │ │
│  │  │  Total                   Rp 405.000         │       │ │
│  │  │  ──────────────────────────────────         │       │ │
│  │  │  Yang dibayar (DP 50%)   Rp 202.500         │       │ │
│  │  │  Sisa bayar di tempat    Rp 202.500         │       │ │
│  │  │                                             │       │ │
│  │  │  [🟠 KONFIRMASI & BAYAR]                    │       │ │
│  │  │                                             │       │ │
│  │  │  ⏱️ Batas pembayaran: 1 jam setelah         │       │ │
│  │  │     konfirmasi                              │       │ │
│  │  └─────────────────────────────────────────────┘       │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  Mobile: panels stacked vertically, summary at bottom        │
│                                                              │
└══════════════════════════════════════════════════════════════┘
```

#### Payment Instruction Page (after confirm)

```
┌══════════════════════════════════════════════════════════════┐
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ✅ Booking Berhasil Dibuat!                         │    │
│  │                                                     │    │
│  │  Silakan transfer ke:                               │    │
│  │                                                     │    │
│  │  ┌───────────────────────────────────────────┐     │    │
│  │  │  [Logo BCA]                                │     │    │
│  │  │  Bank BCA                                  │     │    │
│  │  │  No. Rekening: 1234567890                  │     │    │
│  │  │  Atas Nama: PT JayField Indonesia          │     │    │
│  │  │  Jumlah: Rp 202.500                        │     │    │
│  │  │                              [📋 Copy]     │     │    │
│  │  └───────────────────────────────────────────┘     │    │
│  │                                                     │    │
│  │  ⏱️ Batas waktu: 58:32 (countdown timer)            │    │
│  │                                                     │    │
│  │  ─────────────────────────────────────────────     │    │
│  │                                                     │    │
│  │  Upload Bukti Transfer:                             │    │
│  │  ┌───────────────────────────────────────────┐     │    │
│  │  │                                           │     │    │
│  │  │    [📷 Klik atau drag foto di sini]       │     │    │
│  │  │    Max 5MB (JPG, PNG)                     │     │    │
│  │  │                                           │     │    │
│  │  └───────────────────────────────────────────┘     │    │
│  │                                                     │    │
│  │  [🟢 UPLOAD & KONFIRMASI]                           │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└══════════════════════════════════════════════════════════════┘
```


---

### 3.4 User Dashboard

#### Dashboard Overview

```
┌══════════════════════════════════════════════════════════════┐
│                          NAVBAR                              │
├═══════════════┬══════════════════════════════════════════════┤
│               │                                              │
│   SIDEBAR     │  H2: "Dashboard"                             │
│               │                                              │
│  👤 Nama User │  ┌─────────────┐ ┌─────────────┐           │
│  ⭐ Gold      │  │ 📅 Booking  │ │ 🏆 Poin     │           │
│               │  │ Aktif: 2    │ │ Total: 850  │           │
│  ────────     │  └─────────────┘ └─────────────┘           │
│  📋 Overview  │                                              │
│  📅 Booking   │  ┌─────────────┐ ┌─────────────┐           │
│  🏆 Member    │  │ ⭐ Tier     │ │ 🔔 Notif    │           │
│  💰 Poin      │  │ GOLD        │ │ 3 unread    │           │
│  🔔 Notif     │  └─────────────┘ └─────────────┘           │
│  ❤️ Favorit   │                                              │
│  ⚙️ Profil    │  H3: "Booking Mendatang"                    │
│               │                                              │
│  ────────     │  ┌─────────────────────────────────────┐   │
│  🚪 Logout    │  │ 📅 Rabu, 28 Mei 2026               │   │
│               │  │ 🕐 19:00 - 21:00                    │   │
│               │  │ 🏟️ Lapangan 1 — Lokasi A            │   │
│               │  │ Status: ✅ Confirmed                 │   │
│               │  │            [Lihat Detail] [Batalkan] │   │
│               │  └─────────────────────────────────────┘   │
│               │                                              │
│               │  ┌─────────────────────────────────────┐   │
│               │  │ 📅 Jumat, 30 Mei 2026               │   │
│               │  │ 🕐 20:00 - 22:00                    │   │
│               │  │ 🏟️ Lapangan 3 — Lokasi B            │   │
│               │  │ Status: 🟡 Pending Payment           │   │
│               │  │            [Bayar Sekarang]          │   │
│               │  └─────────────────────────────────────┘   │
│               │                                              │
├═══════════════┴══════════════════════════════════════════════┤
│  Mobile: sidebar becomes bottom tab bar                      │
│  Tabs: 📋 Home | 📅 Booking | 🏆 Member | 🔔 Notif | ⚙️     │
└══════════════════════════════════════════════════════════════┘
```

#### Membership Page

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  H2: "Membership"                                            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Tier Anda: ⭐ GOLD                                   │   │
│  │  Total Poin: 850                                      │   │
│  │  Total Booking: 35                                    │   │
│  │                                                      │   │
│  │  Progress bar:                                        │   │
│  │  [████████████████████████] GOLD (Tier Tertinggi!)   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  H3: "Benefit Anda"                                          │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐              │
│  │ ✓ Diskon   │ │ ✓ Priority │ │ ✓ Extra    │              │
│  │   20%      │ │   Booking  │ │   Time 15' │              │
│  └────────────┘ └────────────┘ └────────────┘              │
│                                                              │
│  H3: "Tier Comparison"                                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │       Bronze        Silver          Gold             │   │
│  │  ─────────────────────────────────────────────       │   │
│  │  Poin: ✓          Poin: ✓        Poin: ✓            │   │
│  │  Promo: ✓         Diskon 10%: ✓  Diskon 20%: ✓      │   │
│  │                   Priority: ✓    Priority: ✓         │   │
│  │                                  Extra Time: ✓       │   │
│  │                                  Event VIP: ✓        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  H3: "Tukar Poin"                                            │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐              │
│  │ Diskon 10% │ │ Diskon 25% │ │ Free 1 Jam │              │
│  │ 100 poin   │ │ 200 poin   │ │ 500 poin   │              │
│  │ [Tukar]    │ │ [Tukar]    │ │ [Tukar]    │              │
│  └────────────┘ └────────────┘ └────────────┘              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```


---

### 3.5 Admin Dashboard

#### Admin Overview

```
┌══════════════════════════════════════════════════════════════┐
│  [Logo] JayField Admin                    [🔔 5] [👤 Admin] │
├═══════════════┬══════════════════════════════════════════════┤
│               │                                              │
│   SIDEBAR     │  H2: "Overview"                              │
│   (Dark bg)   │                                              │
│               │  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────┐ │
│  📊 Overview  │  │Today's │ │Revenue │ │Pending │ │Occup.│ │
│  📅 Booking   │  │Booking │ │Today   │ │Payment │ │Rate  │ │
│  💳 Payments  │  │  12    │ │2.5 Jt  │ │   5    │ │ 78%  │ │
│  🏟️ Courts    │  │ ↑ 20%  │ │ ↑ 15%  │ │        │ │      │ │
│  📍 Locations │  └────────┘ └────────┘ └────────┘ └──────┘ │
│  💰 Pricing   │                                              │
│  👥 Members   │  ┌──────────────────────────────────────┐   │
│  🎫 Promos    │  │  📈 Revenue Chart (Line Graph)        │   │
│  📈 Reports   │  │  [7 Hari] [30 Hari] [3 Bulan]        │   │
│  💸 Refunds   │  │                                      │   │
│  👤 Users     │  │      /\    /\                         │   │
│  ⚙️ Settings  │  │     /  \  /  \    /\                  │   │
│               │  │    /    \/    \  /  \                 │   │
│               │  │   /            \/    \                │   │
│               │  │  /                    \               │   │
│               │  └──────────────────────────────────────┘   │
│               │                                              │
│               │  ┌─────────────────┐ ┌─────────────────┐   │
│               │  │ Recent Bookings │ │ Pending Payments │   │
│               │  │                 │ │                  │   │
│               │  │ • Ahmad — 19:00 │ │ • Budi — BCA    │   │
│               │  │   Lapangan 1 ✅  │ │   Rp 250.000    │   │
│               │  │ • Doni — 20:00  │ │   [✓] [✗]       │   │
│               │  │   Lapangan 2 🟡  │ │ • Sari — Dana   │   │
│               │  │ • Sari — 21:00  │ │   Rp 150.000    │   │
│               │  │   Lapangan 1 🟡  │ │   [✓] [✗]       │   │
│               │  │                 │ │                  │   │
│               │  │ [Lihat Semua →] │ │ [Lihat Semua →] │   │
│               │  └─────────────────┘ └─────────────────┘   │
│               │                                              │
└═══════════════┴══════════════════════════════════════════════┘
```

#### Admin Booking Management

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  H2: "Manajemen Booking"                                     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 🔍 Search...  [Status ▼] [Lokasi ▼] [Tanggal ▼]     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  [All: 156] [Pending: 8] [Confirmed: 12] [Completed: 130]   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ID     │ User    │ Lapangan  │ Tanggal   │ Status   │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ #1234  │ Ahmad   │ Lap.1 A   │ 28/05/26  │ 🟡Pending│   │
│  │ #1233  │ Budi    │ Lap.2 A   │ 28/05/26  │ ✅Confir │   │
│  │ #1232  │ Citra   │ Lap.1 B   │ 27/05/26  │ ✅Done   │   │
│  │ #1231  │ Doni    │ Lap.3 A   │ 27/05/26  │ ❌Cancel │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Pagination: [← Prev] 1 2 3 ... 8 [Next →]                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### Admin Payment Confirmation

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  H2: "Konfirmasi Pembayaran"                                 │
│                                                              │
│  Tab: [Pending (5)] [Confirmed] [Rejected]                   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  │  Booking #1234 — Ahmad Rizki                          │   │
│  │  Lapangan 1, Lokasi A — 28 Mei 2026, 19:00-21:00     │   │
│  │  Tipe: DP 50%                                         │   │
│  │  Jumlah: Rp 250.000                                   │   │
│  │  Metode: BCA                                          │   │
│  │  Waktu upload: 28 Mei 2026, 14:30                     │   │
│  │                                                      │   │
│  │  ┌──────────────────┐                                │   │
│  │  │  [Bukti Transfer │                                │   │
│  │  │   — Foto/Image]  │  ← Click to enlarge            │   │
│  │  │                  │                                │   │
│  │  └──────────────────┘                                │   │
│  │                                                      │   │
│  │  [🟢 KONFIRMASI]   [🔴 TOLAK]   [💬 Catatan]         │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```


---

## 4. User Flow Diagrams

### 4.1 Booking Flow (Complete)

```
[Landing Page]
     │
     ▼ Click "Book Sekarang"
[Check Auth] ──── Not logged in ────> [Login/Register Page]
     │                                        │
     │ Logged in                              │ Success
     ▼                                        ▼
[Pilih Lokasi] ◄──────────────────────────────┘
     │
     ▼ Select location
[Pilih Lapangan]
     │
     ▼ Select court
[Pilih Jadwal]
     │ Select date + time slots
     │ (Optional: enable recurring)
     ▼
[Konfirmasi Booking]
     │ Select payment type (DP/Full)
     │ Select payment method
     │ Apply promo code (optional)
     ▼
[Payment Instruction]
     │ Show bank details + countdown timer
     │ User transfers money
     ▼
[Upload Bukti Transfer]
     │
     ▼ Upload success
[Waiting Confirmation] ──── Admin rejects ────> [CANCELLED]
     │                                              │
     │ Admin confirms                               ▼
     ▼                                    [Notification: Rejected]
[BOOKING CONFIRMED]
     │
     ▼ H-1
[Email Reminder]
     │
     ▼ Booking date
[User plays futsal]
     │
     ▼ After session
[COMPLETED] ──── Prompt review ────> [Write Review] ──> [+5 Poin]
     │
     ▼
[+10 Poin per hour] ──── Check tier ────> [Tier Upgrade?]
```

### 4.2 Cancellation & Refund Flow

```
[Booking CONFIRMED]
     │
     ▼ User clicks "Batalkan"
[Confirm Cancellation Modal]
     │ "Apakah Anda yakin?"
     │ Show refund amount based on policy
     ▼
[Calculate Refund]
     │
     ├── H-1 (>24h) ──> Refund 100% DP
     ├── Same day >3h ──> Refund 50% DP  
     └── <3h ──> No refund
     │
     ▼
[Booking CANCELLED]
     │
     ▼ If refund > 0
[Fill Refund Details]
     │ Bank name, account number, account holder
     ▼
[Refund REQUESTED]
     │
     ▼ Admin reviews
[Admin Approve/Reject]
     │
     ├── Approved ──> [Admin transfers] ──> [PROCESSED] ──> [Email notification]
     └── Rejected ──> [Email: Rejected + reason]
```

### 4.3 Member Tier Upgrade Flow

```
[User completes booking]
     │
     ▼
[Add points: +10/hour]
[Increment total_bookings]
     │
     ▼
[Check upgrade conditions]
     │
     ├── Bronze user + (bookings >= 15 OR points >= 500)
     │   └── Upgrade to SILVER
     │       └── Email: "Selamat! Anda Silver Member"
     │       └── In-app notification
     │       └── Unlock: Diskon 10%, Priority Booking
     │
     └── Silver user + (bookings >= 30 OR points >= 1500)
         └── Upgrade to GOLD
             └── Email: "Selamat! Anda Gold Member"
             └── In-app notification
             └── Unlock: Diskon 20%, Extra Time, VIP Events
```


---

## 5. Responsive Design Strategy

### 5.1 Layout Approach

| Breakpoint | Layout | Navigation | Grid |
|-----------|--------|-----------|------|
| Mobile (<768px) | Single column | Hamburger + drawer | 1 col |
| Tablet (768-1024px) | Flexible | Condensed navbar | 2 cols |
| Desktop (>1024px) | Multi-column | Full navbar | 3-4 cols |

### 5.2 Mobile-Specific Adaptations

| Component | Desktop | Mobile |
|-----------|---------|--------|
| Navbar | Full horizontal links | Hamburger + slide-in drawer |
| Hero | Large text + 2 buttons side by side | Smaller text + stacked buttons |
| Cards | 3-4 per row | 1 per row (full width) |
| Booking calendar | Full month view | Week view with swipe |
| Time slots | Grid layout | Vertical scroll list |
| Confirmation page | 2 panels side by side | Stacked (details top, summary bottom) |
| Dashboard sidebar | Fixed left sidebar | Bottom tab navigation |
| Tables (admin) | Full table | Card/list view per row |
| Footer | 4 columns | Stacked accordion |

### 5.3 Touch-Friendly Guidelines

- Minimum tap target: 44x44px
- Spacing between interactive elements: minimum 8px
- Swipeable carousels for testimonials, promos
- Pull-to-refresh on booking list
- Sticky CTA button at bottom on mobile booking flow

---

## 6. Animation & Micro-interactions

### 6.1 Page Transitions

| Transition | Type | Duration |
|-----------|------|----------|
| Page load | Fade in + slide up | 300ms |
| Modal open | Scale from center + fade | 200ms |
| Modal close | Scale down + fade out | 150ms |
| Drawer (mobile) | Slide from right | 250ms |
| Tab switch | Fade crossfade | 200ms |

### 6.2 Component Animations

| Component | Interaction | Animation |
|-----------|------------|-----------|
| Buttons | Hover | Scale 1.02 + shadow increase |
| Cards | Hover | TranslateY(-2px) + shadow-lg |
| Navbar | Scroll | Background fade from transparent to white |
| Time slot | Select | Border color change + check icon pop |
| Notification bell | New notif | Subtle shake/wiggle |
| Progress bar (tier) | Page load | Fill animation left-to-right |
| Counter (social proof) | Scroll into view | Count up animation |
| Accordion (FAQ) | Toggle | Smooth height transition |
| Toast notifications | Appear | Slide in from top-right |

### 6.3 Loading States

| State | Visual |
|-------|--------|
| Page loading | Skeleton screens (not spinners) |
| Button loading | Spinner inside button + disabled state |
| Image loading | Blur placeholder → sharp image |
| Data fetching | Skeleton rows/cards |
| Upload progress | Progress bar with percentage |

---

## 7. Iconography & Imagery

### 7.1 Icons

- **Library:** Lucide React
- **Style:** Outlined, 24px default, 1.5px stroke
- **Color:** Inherit from parent (follows text color)

### 7.2 Photography Style

| Usage | Style |
|-------|-------|
| Hero background | Wide-angle futsal court, action shots, warm lighting |
| Court photos | Clean, well-lit, showing full court |
| Facility icons | Minimal line icons or small photos |
| Testimonial avatars | Circular crop, 48px |
| Promo banners | Bold colors, dynamic, sporty typography |

### 7.3 Illustrations (Empty States)

| State | Illustration |
|-------|-------------|
| No bookings | Person kicking ball with "Belum ada booking" text |
| No notifications | Bell with "Semua sudah terbaca" |
| Empty search | Magnifying glass with "Tidak ditemukan" |
| Payment success | Checkmark celebration |
| Error page | Confused goalkeeper |

---

## 8. Accessibility (a11y)

| Requirement | Implementation |
|------------|---------------|
| Color contrast | Min 4.5:1 for text, 3:1 for large text |
| Focus indicators | Visible ring (2px offset) on all interactive elements |
| Screen reader | All images have alt text, aria-labels on icons |
| Keyboard nav | Tab order logical, Enter/Space for activation |
| Form labels | All inputs have associated labels |
| Error messages | Connected via aria-describedby |
| Skip link | "Skip to content" hidden link |
| Reduced motion | Respect prefers-reduced-motion |
| Language | lang attribute on html tag (id/en) |

---

## 9. Email Template Design

### 9.1 Email Layout

```
┌──────────────────────────────────────┐
│  [Logo JayField]                      │
│  Background: #1B5E20 (header)         │
├──────────────────────────────────────┤
│                                      │
│  H2: Subject/Title                    │
│                                      │
│  Body content...                      │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  Detail Box (if applicable)    │  │
│  │  📍 Lokasi: ...                │  │
│  │  📅 Tanggal: ...               │  │
│  │  🕐 Waktu: ...                 │  │
│  └────────────────────────────────┘  │
│                                      │
│  [CTA Button — #FF6D00]              │
│                                      │
├──────────────────────────────────────┤
│  Footer: Unsubscribe | Help          │
│  © 2026 JayField                      │
└──────────────────────────────────────┘
```

- Max width: 600px
- Font: System fonts (Apple, Segoe, Roboto)
- Mobile responsive (single column always)

---

## 10. Dark Mode (Future Enhancement)

Reserved color tokens for potential dark mode:

| Token | Light | Dark (future) |
|-------|-------|---------------|
| background | #FAFAFA | #121212 |
| surface | #FFFFFF | #1E1E1E |
| text-primary | #1A1A1A | #E0E0E0 |
| text-secondary | #616161 | #9E9E9E |
| border | #E0E0E0 | #333333 |

*Dark mode will be considered in Phase 4 (Future).*

---

*Dokumen ini menjadi acuan visual untuk seluruh development JayField.*

**Dibuat:** 28 Mei 2026
**Versi:** 1.0
**Referensi:** JayField-PRD.md, requirements.md
