# JayField — Website Booking Lapangan Futsal

> Platform booking lapangan futsal multi-lokasi dengan sistem member, pembayaran transfer manual, dashboard admin, dan PWA support.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://www.prisma.io)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css)](https://tailwindcss.com)

JayField adalah aplikasi web full-stack untuk bisnis penyewaan lapangan futsal dengan multi-lokasi. Pelanggan bisa memesan lapangan, bayar via transfer manual, kumpulkan poin, dan claim reward — semuanya online. Admin punya dashboard lengkap untuk mengelola operasional.

**Live demo**: (atur URL kalau sudah deploy)
**Test credentials**: lihat [PANDUAN-JAYFIELD.md](./PANDUAN-JAYFIELD.md#3-akun-awal--cara-login)

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Persyaratan](#persyaratan)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Cron Jobs](#cron-jobs)
- [Struktur Project](#struktur-project)
- [Implementasi Status](#implementasi-status)
- [Test Credentials](#test-credentials)
- [Deployment](#deployment)
- [Dokumentasi Lain](#dokumentasi-lain)
- [Lisensi](#lisensi)

## Fitur Utama

### Untuk Pelanggan
- 🏟️ **Booking lapangan online** — pilih lokasi → lapangan → jadwal → bayar dalam 4 langkah, dengan stepper visual
- 💳 **Transfer manual + upload bukti** — Bank transfer & E-Wallet (BCA, BNI, Mandiri, GoPay, OVO, Dana)
- 🧾 **DP 50% atau Bayar Full** — fleksibel sesuai pilihan
- 🔁 **Booking berulang** — auto-generate booking mingguan untuk pelanggan rutin
- 🏆 **Sistem member 3-tier** — Bronze (default) → Silver (15 booking / 500 poin, 10% off) → Gold (30 booking / 1500 poin, 20% off)
- 🪙 **Reward store** — tukar poin dengan diskon, free session, atau merchandise (kode `JF-XXXXXX`)
- 🎁 **Referral system** — share kode referral, dapat 20 poin per teman yang booking pertama
- ⭐ **Review & rating** — submit review setelah booking selesai (+5 poin)
- ❤️ **Favorit lapangan** — quick re-book langganan
- 💬 **Notifikasi 3 channel** — email + in-app + push notification (web push API)
- 💰 **Refund otomatis** — H-1: 100%, hari H >3 jam: 50%, <3 jam: tidak ada

### Untuk Admin & Staff
- 📊 **Dashboard overview** — booking hari ini, revenue, occupancy rate, pending payments
- 📅 **Manajemen booking** — list, filter, approve/reject, lihat detail
- 💵 **Konfirmasi pembayaran** — preview bukti transfer, 1-click approve
- 🏟️ **CRUD lapangan & lokasi** — foto, fasilitas, jam operasional, koordinat
- 💲 **Manajemen harga** — matrix Weekday/Weekend × Regular/Prime per lapangan
- 🎟️ **Manajemen promo** — kode, diskon %, periode, syarat tier minimum
- 🎁 **Reward catalog CRUD** — admin bisa tambah/edit reward dinamis
- 👤 **Manajemen member & staff** — adjust poin manual, deactivate user, last-admin protection
- 🔄 **Manajemen refund** — approve/reject/process dengan state machine
- 💬 **Moderasi review** — toggle visible/hidden
- 📈 **Laporan & analytics** — Revenue, Occupancy, Member Growth, Top Courts, Cancellation Rate (with date range filter & CSV export)
- ⚙️ **Pengaturan** — DP%, payment deadline, refund policy, points rules, payment methods

### UX & Performance
- 🌍 **Bilingual** Indonesia + English (next-intl, locale prefix `/id/...` & `/en/...`)
- 🌓 **Dark mode** dengan system detection (FOUC-free)
- 📱 **PWA** — installable, offline support, push notification dengan VAPID
- ⚡ **ISR** untuk public pages (revalidate 60s/3600s)
- 🖼️ **Image optimization** — AVIF/WebP, lazy load, locked remote patterns
- 🔍 **SEO** — JSON-LD structured data (LocalBusiness + SportsActivityLocation), sitemap.xml, robots.txt, hreflang
- 🎯 **Lighthouse** target ≥ 90 (lihat [LIGHTHOUSE.md](./LIGHTHOUSE.md))
- 📦 **Code splitting** — recharts lazy load (~80KB deferred)
- 🔄 **Real-time slot polling** — availability auto-refresh tiap 15 detik
- 🎨 **Premium polish** — booking stepper, live countdown, QR code, smart date picker, image lightbox, smooth scroll, parallax, confetti milestones

### Keamanan
- 🔒 **Bcrypt cost 12** untuk password hashing
- 🔐 **NextAuth JWT session** dengan HttpOnly cookie + 7-day expiry
- 🛡️ **Rate limiting** di endpoint sensitive (login, register, forgot-password, booking)
- 👮 **RBAC** — Admin / Staff / User dengan validasi server-side
- 🚫 **Self-protection** — admin tidak bisa nonaktifkan diri sendiri
- 🛑 **Last-admin protection** — tidak bisa demote/deactivate admin terakhir
- ✅ **Zod validation** di semua API endpoint
- 🗃️ **Prisma ORM** — anti SQL injection
- 🔑 **Optional Google OAuth** — auto-detect env, button hidden kalau tidak dikonfigurasi

Lebih detail di [KEAMANAN-DAN-MAINTENANCE.md](./KEAMANAN-DAN-MAINTENANCE.md).

## Tech Stack

### Core
- **Next.js 14.2** (App Router) — React server components, route handlers, server actions
- **TypeScript 5** — type safety end-to-end
- **React 18** — concurrent rendering, suspense
- **Tailwind CSS 3** — utility-first styling, dark mode via `class` strategy
- **Prisma 5.22** — type-safe ORM
- **PostgreSQL** (via Supabase) — relational DB dengan backup harian

### Auth & Session
- **NextAuth.js 4.24** — credentials + Google OAuth (optional)
- **bcryptjs** — password hashing (cost 12)

### UI & UX
- **Radix UI / shadcn-style** — accessible primitives
- **lucide-react** — icon library
- **sonner** — toast notifications
- **canvas-confetti** — milestone celebrations
- **recharts** — charts di reports (lazy loaded)
- **qrcode** — QR generation untuk booking confirmation
- **next-intl** — i18n bilingual (ID + EN)

### Validation & Forms
- **Zod 4** — runtime + compile-time validation
- **Custom ValidatedInput** — real-time field validation dengan checkmark/error icon

### File Upload & Email
- **UploadThing 7** — file upload dengan typed endpoints (avatar, paymentProof, courtPhoto, locationThumbnail)
- **Resend + react-email** — transactional email dengan 8 templates

### Notifikasi
- **web-push** — push notifications dengan VAPID keys

### State & Utilities
- **Zustand 5** — client state management (skeleton)
- **date-fns 4** — date formatting & manipulation

### Performance & Monitoring
- **@next/bundle-analyzer** — bundle size analysis (`ANALYZE=true npm run build`)
- **next/dynamic** — code splitting untuk heavy components

### Hosting & Infrastructure
- **Vercel** — hosting Next.js + cron jobs (5 cron registered di `vercel.json`)
- **Supabase** — Postgres database + connection pooling

## Persyaratan

- **Node.js** 18.17+ atau 20+
- **npm** 9+ (atau yarn/pnpm)
- **PostgreSQL** 13+ (gratis: Supabase, Neon, Railway)
- **Email service** (opsional): Resend account + verified domain
- **File upload service** (opsional): UploadThing account
- **OAuth provider** (opsional): Google Cloud Console project untuk Google login
- **Cron** (opsional): Vercel hosting otomatis register cron, atau setup manual

## Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd booking-futsal
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
```

Edit `.env` — minimal yang wajib diisi:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<random 32+ char>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Generate `NEXTAUTH_SECRET` random:

```bash
openssl rand -base64 32
```

### 3. Setup Database

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

Setelah seed, akan ada 3 akun siap pakai (lihat [Test Credentials](#test-credentials)).

> ⚠️ **Ganti password 3 default account ini sebelum deploy ke produksi.**

### 4. Jalankan Dev Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Wajib | Deskripsi |
|----------|:-----:|-----------|
| `DATABASE_URL` | ✅ | Postgres connection string (pooled, port 6543 untuk Supabase) |
| `DIRECT_URL` | ✅ | Postgres direct connection (port 5432 untuk Supabase, untuk migrate) |
| `NEXTAUTH_URL` | ✅ | App URL (dev: `http://localhost:3000`, prod: `https://yourdomain.com`) |
| `NEXTAUTH_SECRET` | ✅ | Random 32+ char untuk JWT signing |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public URL (dipakai di sitemap, JSON-LD, share links) |
| `NEXT_PUBLIC_APP_NAME` | ⬜ | Nama brand (default `JayField`) |
| `CRON_SECRET` | ⬜ | Bearer token untuk auth cron endpoints |
| `RESEND_API_KEY` | ⬜ | Resend API key untuk email; kosong = email no-op |
| `EMAIL_FROM` | ⬜ | From address (default `onboarding@resend.dev`) |
| `UPLOADTHING_TOKEN` | ⬜ | UploadThing token untuk file upload |
| `GOOGLE_CLIENT_ID` | ⬜ | Google OAuth client ID; kosong = Google login button hidden |
| `GOOGLE_CLIENT_SECRET` | ⬜ | Google OAuth client secret |
| `VAPID_PUBLIC_KEY` | ⬜ | VAPID public key untuk web push |
| `VAPID_PRIVATE_KEY` | ⬜ | VAPID private key |
| `VAPID_EMAIL` | ⬜ | VAPID contact email (`mailto:...`) |
| `ANALYZE` | ⬜ | Set `true` untuk run bundle analyzer |

Lihat [.env.example](./.env.example) untuk template lengkap.

## Scripts

```bash
npm run dev          # Dev server di http://localhost:3000
npm run build        # Production build
npm run start        # Production server (after build)
npm run lint         # ESLint
npx tsc --noEmit     # Type check tanpa emit

# Prisma
npx prisma generate          # Generate Prisma client
npx prisma migrate dev       # Create migration (dev)
npx prisma migrate deploy    # Apply migrations (production-safe)
npx prisma db seed           # Run seed
npx prisma studio            # Visual DB browser

# Bundle analysis
ANALYZE=true npm run build   # Generate bundle report

# VAPID keys (untuk push notification)
npm run vapid:generate
```

## Cron Jobs

Registered di [`vercel.json`](./vercel.json) — auto-jalan di Vercel hosting:

| Endpoint | Schedule | Fungsi |
|----------|----------|--------|
| `/api/cron/expire-bookings` | `*/5 * * * *` | Auto-cancel booking yang tidak upload bukti dalam 1 jam |
| `/api/cron/complete-bookings` | `*/30 * * * *` | Mark CONFIRMED → COMPLETED + award points + tier upgrade + referral bonus |
| `/api/cron/booking-reminders` | `0 11 * * *` | Kirim H-1 reminder email (jam 18:00 WIB) |
| `/api/cron/generate-recurring` | `1 17 * * *` | Generate next-week booking dari template recurring |
| `/api/cron/cleanup-notifications` | `0 18 * * 0` | Hapus notifikasi yang sudah dibaca > 30 hari |

Auth pakai Bearer `CRON_SECRET` (header `Authorization`). Untuk hosting selain Vercel, setup cron manual ke endpoint-endpoint ini.

## Struktur Project

```
booking-futsal/
├── prisma/
│   ├── schema.prisma           # Data model
│   ├── migrations/             # 5 migrations (init + referral + reward + perf + push)
│   └── seed.ts                 # Seed data dummy
│
├── public/                     # Static assets, og-image, PWA icons
│
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── (auth)/         # Login, Register, Forgot Password
│   │   │   ├── (public)/       # Landing, Locations, Promo, FAQ, Contact
│   │   │   ├── booking/        # Multi-step booking flow
│   │   │   ├── dashboard/      # User dashboard
│   │   │   ├── admin/          # Admin dashboard
│   │   │   └── offline/        # PWA offline fallback
│   │   ├── api/                # 70+ API endpoints
│   │   ├── layout.tsx          # Root layout (theme, fonts, providers)
│   │   ├── manifest.ts         # PWA manifest
│   │   ├── robots.ts           # robots.txt
│   │   └── sitemap.ts          # sitemap.xml
│   │
│   ├── components/
│   │   ├── admin/              # Admin pages (forms, action buttons, reports)
│   │   ├── booking/            # Booking flow (stepper, slot picker, confirm form)
│   │   ├── dashboard/          # User dashboard (sidebar, header, cards)
│   │   ├── landing/            # Landing sections
│   │   ├── layout/             # Navbar, Footer
│   │   ├── providers/          # ThemeProvider, ServiceWorkerProvider
│   │   ├── shared/             # Reusable: Tooltip, ConfirmDialog, EmptyState, Lightbox, Countdown, dll
│   │   └── ui/                 # shadcn-style primitives (button, etc)
│   │
│   ├── emails/                 # 8 react-email templates
│   ├── lib/                    # Helpers: prisma, auth, points, refunds, promos, etc
│   ├── messages/               # i18n: id.json + en.json (~268 keys, parity 100%)
│   └── types/                  # Type definitions
│
├── scripts/
│   └── generate-vapid-keys.ts  # Generate VAPID keypair untuk push
│
├── vercel.json                 # 5 cron job registrations
├── next.config.mjs             # Image patterns, bundle analyzer, next-intl
├── tailwind.config.ts          # Theme tokens (CSS variables for dark mode)
└── *.md                        # Dokumentasi (lihat di bawah)
```

## Implementasi Status

✅ **Phase 1 — MVP**: Landing page, auth, booking dasar, payment manual, admin dashboard
✅ **Phase 2 — Enhanced**: Membership, recurring, notifikasi, refund, gallery & review
✅ **Phase 3 — Advanced**: Reports & analytics, promo, reward catalog dynamic, referral, SEO, performance
✅ **Bonus Phase 4**: Dark mode + PWA + Push notification
✅ **UX Upgrade Pass**: Tier 1 (stepper, skeleton, hint, sticky CTA) + Tier 2 (countdown, QR, calendar export, smart date picker, lightbox, autosuggest, real-time polling)
⏳ **Phase 4 (sisa)**: Payment gateway (Midtrans), WhatsApp notif, mobile app, chatbot — opsional, butuh akun eksternal

Lihat [task.md](./task.md) untuk detail lengkap per task.

## Test Credentials

Setelah `npx prisma db seed`:

| Tipe | Email | Password |
|------|-------|----------|
| Admin | admin@jayfield.com | admin123 |
| Staff | staff@jayfield.com | staff123 |
| User | user@example.com | user123 |

**Promo codes**:
- `JAYFIELD10` — Diskon 10% (max Rp 50.000)
- `MEMBERSILVER` — Diskon Rp 20.000 (Silver+ only)

> ⚠️ Ganti password ini setelah pertama kali login. Untuk production, ganti email admin juga.

## Deployment

### Vercel (recommended)

1. Push repo ke GitHub/GitLab
2. Import ke Vercel
3. Set environment variables (lihat section di atas)
4. Deploy

Migrations otomatis jalan via `prisma migrate deploy` di build step. Cron jobs auto-register dari `vercel.json`.

### Hosting Lain

App ini standar Next.js 14 — bisa deploy ke Railway, Fly.io, AWS, Docker, dll. Yang perlu disesuaikan:
- Setup cron manual untuk 5 endpoint cron
- Setup database backup (kalau bukan Supabase yang otomatis)
- HTTPS / SSL certificate

### Setelah Deploy — Checklist

- [ ] Ganti password 3 default account (admin/staff/user)
- [ ] Set `NEXTAUTH_SECRET` random 32+ chars
- [ ] Setup custom domain
- [ ] Setup `RESEND_API_KEY` + verified domain untuk email
- [ ] Generate VAPID keys untuk push notification (`npm run vapid:generate`)
- [ ] Drop 4 PWA icon ke `/public/`: `icon-192.png`, `icon-512.png`, `icon-maskable-192.png`, `icon-maskable-512.png`
- [ ] Drop OG image ke `/public/og-image.jpg` (1200×630)
- [ ] Setup uptime monitoring (UptimeRobot, Better Stack)
- [ ] Setup error tracking (Sentry — opsional)

## Dokumentasi Lain

| File | Isi | Audiens |
|------|-----|---------|
| [JayField-PRD.md](./JayField-PRD.md) | Product Requirements Document — visi produk, fitur, business rules | Developer, PM |
| [requirements.md](./requirements.md) | Requirements detail per modul | Developer |
| [design.md](./design.md) | Technical design document — arsitektur, data model, UI patterns | Developer |
| [task.md](./task.md) | Task list lengkap Phase 1-3 + UX upgrade pass | Developer |
| [QA-TEST-REPORT.md](./QA-TEST-REPORT.md) | Internal QA test report — 142 test cases, hasil, severity | Developer, QA |
| [UAT-CHECKLIST.md](./UAT-CHECKLIST.md) | User Acceptance Testing checklist (bahasa awam) | Klien |
| [PANDUAN-JAYFIELD.md](./PANDUAN-JAYFIELD.md) | Panduan untuk klien & end-user (bahasa awam) | Klien, end-user |
| [KEAMANAN-DAN-MAINTENANCE.md](./KEAMANAN-DAN-MAINTENANCE.md) | Penjelasan keamanan & maintenance | Klien |
| [LIGHTHOUSE.md](./LIGHTHOUSE.md) | Performance audit & bundle analysis | Developer |
| [PWA.md](./PWA.md) | PWA setup, VAPID keys, push notification | Developer |

## Kontribusi & Support

Project ini di-build untuk klien spesifik. Untuk:
- **Custom feature request** — hubungi developer
- **Bug report** — buka issue dengan reproducible steps
- **Security disclosure** — email developer langsung (jangan public issue)

## Lisensi

Project ini proprietary — bukan open source. Hak pakai sesuai kontrak dengan klien.

---

*Built with ⚽ by JayField development team. Last updated: Mei 2026.*
