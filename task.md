# Task List — JayField Development
# Website Booking Lapangan Futsal

> **Status legend**
> - `[x]` Selesai & terverifikasi
> - `[~]` Foundation/infrastructure siap, tinggal wiring di modul terkait
> - `[ ]` Belum dikerjakan

---

## Phase 1 — MVP (4-6 Minggu) ✅

### 1.1 Project Setup & Architecture

- [x] Initialize Next.js 14 project (App Router, TypeScript)
- [x] Install & configure Tailwind CSS
- [x] Install & configure shadcn/ui
- [x] Setup font (Montserrat + Inter via Google Fonts)
- [x] Configure color palette (sporty green + orange CTA) di `tailwind.config.ts`
- [x] Setup folder structure sesuai TDD
- [x] Install & configure Prisma ORM
- [x] Setup PostgreSQL database (Supabase/Railway/Neon)
- [x] Create database schema (`prisma/schema.prisma`)
- [x] Run initial migration
- [x] Seed data awal (lokasi, lapangan, pricing, admin user)
- [x] Install & configure NextAuth.js (credentials + Google OAuth)
- [x] Setup next-intl (bilingual ID/EN)
- [x] Create translation files (`messages/id.json`, `messages/en.json`)
- [x] Setup middleware (auth + i18n locale routing)
- [x] Setup environment variables (`.env.example`)
- [x] Setup Zod validation schemas
- [x] Setup Zustand store skeleton
- [x] Install utility libraries (date-fns, lucide-react)
- [x] Create root layout (`src/app/layout.tsx`)
- [x] Create base components (Navbar placeholder, Footer placeholder)

### 1.2 Landing Page

- [x] Create landing page route (`/[locale]/page.tsx`)
- [x] Build Hero Section (full-screen, background image, CTA buttons)
- [x] Build Social Proof Bar (stats counter with animation)
- [x] Build Info Lapangan & Fasilitas Section
- [x] Build Lokasi Section (location cards + map placeholder)
- [x] Build Harga Section (pricing table with weekday/weekend tabs)
- [x] Build Gallery Section (image grid with lightbox)
- [x] Build Promo & Event Section (promo cards carousel)
- [x] Build Testimoni Section (review cards carousel)
- [x] Build FAQ Section (accordion)
- [x] Build Final CTA Section (gradient background)
- [x] Build Footer (4-column layout)
- [x] Build Navbar (transparent → solid on scroll, mobile hamburger + drawer)
- [x] Implement responsive design (mobile, tablet, desktop)
- [x] Implement bilingual toggle (ID/EN switch)
- [x] Add scroll animations (fade-in, count-up for stats)
- [x] SEO: meta tags, Open Graph, structured data
- [x] Performance: optimize images, lazy loading

### 1.3 Authentication System

- [x] Create Login page (`/[locale]/login/page.tsx`)
- [x] Create Register page (`/[locale]/register/page.tsx`)
- [x] Create Forgot Password page
- [x] Implement email + password login (NextAuth credentials) — *bcrypt verify fixed pada Phase 2 foundation*
- [x] Implement Google OAuth login
- [x] Implement registration flow (create user, hash password, assign Bronze tier)
- [x] Implement forgot password flow (send reset email) — *audit fix: wired ke `sendPasswordResetEmail` (no-op tanpa RESEND_API_KEY) + rate limit*
- [x] Create reset password page & API
- [x] Setup session management (JWT in cookie)
- [x] Create auth middleware (protect routes)
- [x] Create API: `POST /api/auth/register`
- [x] Create API: `POST /api/auth/forgot-password`
- [x] Create API: `POST /api/auth/reset-password`
- [x] Error handling (invalid credentials, duplicate email, etc.)
- [x] Form validation with Zod
- [x] Bilingual auth pages

### 1.4 Booking System (Basic)

- [x] Create Pilih Lokasi page (`/[locale]/booking/page.tsx`) — *audit fix: ganti dari mock hardcoded ke server component + Prisma + DebouncedSearch*
- [x] Create Pilih Lapangan page (`/[locale]/booking/[locationId]/page.tsx`) — *audit fix: server component dari DB + filter Indoor/Outdoor*
- [x] Create Pilih Jadwal page (`/[locale]/booking/[locationId]/[courtId]/page.tsx`) — *audit fix: real availability API + contiguous slot validation*
- [x] Create Konfirmasi & Bayar page (`/[locale]/booking/confirm/page.tsx`) — *audit fix: real `POST /api/bookings`, payment methods dari DB, promo validate via `validateDiscountCode`, redirect ke `/dashboard/bookings/[id]` untuk upload bukti*
- [x] Build location list component (cards with search/filter)
- [x] Build court selection component (cards with type filter)
- [x] Build calendar component (date picker, month view)
- [x] Build time slot grid (available/pending/booked status)
- [x] Implement availability check logic (real-time)
- [x] Implement price calculation logic (regular vs prime-time, weekday vs weekend)
- [x] Build booking summary/confirmation component
- [x] Build payment type selector (DP vs Full)
- [x] Build payment method selector (banks + e-wallets)
- [x] Build promo code input & validation
- [x] Implement booking creation flow
- [x] Create API: `GET /api/locations`
- [x] Create API: `GET /api/courts?locationId=xxx`
- [x] Create API: `GET /api/courts/[id]/availability?date=xxx`
- [x] Create API: `POST /api/bookings`
- [x] Create API: `POST /api/promos/validate`
- [x] Implement double-booking prevention (locking mechanism)
- [x] Auth guard (redirect to login if not authenticated)
- [x] Responsive booking flow (mobile-friendly)
- [x] Bilingual booking pages

### 1.5 Pembayaran DP (Transfer Manual)

- [x] Create Payment Instruction page (after booking created)
- [x] Build payment info display (bank details, amount, copy button)
- [x] Build countdown timer (1 hour deadline)
- [x] Build upload bukti transfer component (drag & drop, preview)
- [x] Implement file upload (UploadThing) — wired di `PaymentProofUploader` (booking detail page) → endpoint `paymentProof` → POST `/api/payments/upload-proof` dengan toast feedback
- [x] Create API: `GET /api/payments/[bookingId]`
- [x] Create API: `POST /api/payments/upload-proof`
- [x] Implement auto-expiration (booking → EXPIRED after 1 hour)
- [x] Create payment status page (waiting confirmation)
- [x] Add payment method management in admin settings
- [x] Create API: `GET /api/payment-methods` (active methods)

### 1.6 Admin Dashboard (Basic)

- [x] Create admin layout (sidebar + top bar)
- [x] Create admin overview page (`/[locale]/admin/page.tsx`)
- [x] Build overview stats cards (today's bookings, revenue, pending payments, occupancy)
- [x] Create booking management page (`/[locale]/admin/bookings/page.tsx`)
- [x] Build booking list table (sortable, filterable, paginated)
- [x] Implement booking approve/reject actions
- [x] Create payment confirmation page (`/[locale]/admin/payments/page.tsx`)
- [x] Build pending payment list (with proof image preview)
- [x] Implement payment confirm/reject with 1-click
- [x] Create API: `GET /api/admin/bookings`
- [x] Create API: `PUT /api/admin/bookings/[id]/confirm`
- [x] Create API: `PUT /api/admin/bookings/[id]/reject`
- [x] Create API: `GET /api/admin/payments`
- [x] Create API: `PUT /api/admin/payments/[id]/confirm`
- [x] Create API: `PUT /api/admin/payments/[id]/reject`
- [x] Role-based access control (only ADMIN/STAFF can access)
- [x] Responsive admin dashboard
- [x] Bilingual admin pages

### 1.7 Bilingual (i18n) — Finalisasi

- [x] Complete translation file `messages/id.json` (semua text)
- [x] Complete translation file `messages/en.json` (semua text)
- [x] Implement locale switcher in navbar
- [x] Verify all pages render correctly in both languages
- [x] URL routing: `/id/...` dan `/en/...`

### 1.8 Mobile Responsive — Finalisasi

- [x] Test semua halaman di mobile (< 768px)
- [x] Test semua halaman di tablet (768-1024px)
- [x] Fix layout issues
- [x] Verify touch-friendly interactions (min 44px tap targets)
- [x] Test mobile navigation (hamburger + drawer)
- [x] Test booking flow on mobile (stacked layout)

---

## Phase 2 — Enhanced (3-4 Minggu) ✅ — COMPLETE

### 2.0 Foundation Setup ✅ (NEW — selesai di Step 1)

- [x] Install dependencies (resend, uploadthing, @uploadthing/react, @react-email/components, react-email)
- [x] Fix bcrypt password verification di `src/lib/auth.ts` (Phase 1 hotfix)
- [x] Create `src/lib/api-response.ts` — standardized API response (`ok`, `created`, `fail`, `errors.*`)
- [x] Create `src/lib/auth-helpers.ts` — `requireUser()`, `requireRole()`, `getSessionUser()`, `AuthError`
- [x] Create `src/lib/email.ts` — Resend client wrapper (no-op tanpa API key)
- [x] Create `src/lib/notifications.ts` — `createNotification()`, `markAsRead`, `markAllAsRead`, `getUnreadCount`
- [x] Create `src/lib/points.ts` — `awardPoints()`, `nextTier()`, `maybeUpgradeTier()`, `isOffPeakHour()`
- [x] Create `src/lib/uploadthing.ts` — typed `<UploadButton/>`, `<UploadDropzone/>`, `useUploadThing()`
- [x] Create `src/lib/cron.ts` — `isAuthorizedCronRequest()` untuk Vercel Cron Bearer auth
- [x] Create UploadThing file router (`src/app/api/uploadthing/core.ts`) — endpoint: avatar, paymentProof, courtPhoto, locationThumbnail
- [x] Create UploadThing route handler (`src/app/api/uploadthing/route.ts`)
- [x] Create email templates di `src/emails/`: welcome, password-reset, booking-confirmed, booking-reminder, tier-upgrade
- [x] Create email template components (`base-layout.tsx`, `button.tsx`)
- [x] Create email render helpers (`src/emails/render.ts`)
- [x] Create `vercel.json` — register 4 cron jobs (expire-bookings, booking-reminders, generate-recurring, cleanup-notifications)
- [x] Update `.env.example` — tambah `UPLOADTHING_TOKEN`, `CRON_SECRET`, perbaiki format `EMAIL_FROM`
- [x] TypeScript type-check pass (`tsc --noEmit`)

### 2.0b Dashboard Skeleton + Profile + Password ✅ (selesai di Step 2)

- [x] `DashboardSidebar` component dengan 8 nav items (Beranda, Booking, Recurring, Membership, Poin, Favorit, Notifikasi, Profil) + tombol "Booking Baru"
- [x] `DashboardHeader` component — locale switcher, notification bell dengan auto-refresh badge (60s polling), avatar + user dropdown menu (profile, logout, mobile locale)
- [x] `DashboardLayout` shell + `app/[locale]/dashboard/layout.tsx` server component dengan auth guard (redirect ke `/login?callbackUrl=/dashboard`)
- [x] Refactor `/dashboard/page.tsx` — server component, real stats dari DB (active bookings, points, tier, unread notif), tier progress bar, list 3 upcoming bookings
- [x] `ProfileForm` client component — edit nama, phone, avatar (UploadThing endpoint `avatar`), email locked, validation feedback
- [x] `ChangePasswordForm` client component — old/new/confirm dengan show/hide, validation, redirect setelah sukses
- [x] `/dashboard/profile/page.tsx` — full profile page + link ke ubah password (auto-hide untuk OAuth user)
- [x] `/dashboard/profile/password/page.tsx` — change password page (redirect kalau OAuth-only user)
- [x] `/dashboard/recurring/page.tsx` — placeholder untuk modul 2.2
- [x] Validation schema: `src/lib/validations/profile.ts` (`updateProfileSchema`, `changePasswordSchema`)
- [x] API: `GET /api/members/profile` (full profile + canChangePassword flag)
- [x] API: `PUT /api/members/profile` (update name, phone, avatarUrl)
- [x] API: `POST /api/members/change-password` (verify old via bcrypt, hash new)
- [x] API: `GET /api/notifications/unread-count` (untuk header bell badge)
- [x] i18n: tambah `dashboardNav.*` (overview, my_bookings, recurring, membership, points, favorites, notifications, profile, book_now) + `dashboard.greeting` di `id.json` & `en.json`
- [x] TypeScript type-check pass + production build sukses (29 routes generated)
- [x] Smoke test: unauth `/dashboard` → 307 redirect; unauth `/api/members/profile` → 401


### 2.1 Membership System (Tier + Poin) ✅ (selesai di Step 3)

- [x] Implement tier system logic (Bronze → Silver → Gold) — *helper `nextTier()` & `maybeUpgradeTier()`*
- [x] Implement point earning (after booking completed) — *via cron `/api/cron/complete-bookings` + `awardBookingCompletionPoints()`*
- [x] Implement point earning (after review submitted) — wired di POST/DELETE /api/reviews (auto-award 5 poin + reversal)
- [x] Implement point earning (referral) — wired via lib/referrals.ts + register + booking completion (idempotent)
- [x] Implement point earning (off-peak bonus) — *otomatis di `awardBookingCompletionPoints` via `isOffPeakHour()`*
- [x] Implement tier upgrade check (after each completed booking) — *cron + email + in-app notification*
- [x] Create membership page in user dashboard
- [x] Build tier progress bar component (di membership page)
- [x] Build benefits display component
- [x] Build tier comparison table
- [x] Create points history page (`/dashboard/points`) — tabs Semua/Diterima/Ditukar + pagination
- [x] Build points history list (earned/redeemed log)
- [x] Implement point redemption (diskon 10%/25%, free session, merchandise) — generate kode unik
- [x] Create API: `GET /api/members/profile`
- [x] Create API: `GET /api/members/points-history`
- [x] Create API: `GET /api/members/rewards` — catalog + active redemptions
- [x] Create API: `POST /api/members/redeem` — atomic transaksi (deduct + log + generate code)
- [x] Apply member discount automatically at booking — Bronze 0%, Silver 10%, Gold 20% di `POST /api/bookings`
- [x] Admin: member management page (`/admin/members`) — search, filter tier, stats summary
- [x] Admin: detail member page (`/admin/members/[id]`) — info + points history + redemptions + adjust panel
- [x] Admin: manual point adjustment dengan tier auto-upgrade trigger
- [x] Create API: `GET /api/admin/members` (search, tier filter, pagination)
- [x] Create API: `GET /api/admin/members/[id]` (detail)
- [x] Create API: `PUT /api/admin/members/[id]/adjust-points` (admin-only)
- [x] Cron `/api/cron/complete-bookings` — daily-ish (every 30 min), idempotent, transitions CONFIRMED → COMPLETED + awards points + tier upgrade
- [x] New schema: `Redemption` model (generate `JF-XXXXXX` discount codes)
- [x] Production build pass (39 routes generated)


### 2.2 Recurring Booking ✅ (selesai di Step 7)

- [x] Add recurring option in booking flow (checkbox + day inferred from date) — *sudah ada di Phase 1, sekarang wired ke `RecurringBooking` template*
- [x] Create recurring booking database logic — *idempotent template create di `POST /api/bookings` saat `isRecurring=true`*
- [x] Implement recurring booking generator (scheduled job) — *cron `/api/cron/generate-recurring` dengan idempotency + conflict detection*
- [x] Create recurring booking management in user dashboard — *`/dashboard/recurring` real (replace placeholder)*
- [x] Allow user to pause/cancel recurring bookings
- [x] Create API: `GET /api/recurring-bookings`
- [x] Create API: `POST /api/recurring-bookings`
- [x] Create API: `PUT /api/recurring-bookings/[id]` — pause/resume + set endDate
- [x] Create API: `DELETE /api/recurring-bookings/[id]` — soft cancel
- [x] Setup cron job: generate next-week bookings daily — *registered di `vercel.json` dan endpoint aktif*
- [x] Validation schema `src/lib/validations/recurring-booking.ts`
- [x] Component `RecurringBookingActions` (pause/resume/cancel dengan confirm)
- [x] Production build pass (64 routes)

### 2.3 Notification System ✅ (selesai di Step 4)

- [x] Setup email service (Resend API) — *via `src/lib/email.ts`*
- [x] Create email templates lengkap — 8 templates: welcome, password-reset, booking-created, booking-confirmed, booking-cancelled, booking-reminder, tier-upgrade, refund-processed
- [x] Implement email sending on booking events — `POST /api/bookings` (booking-created), payment confirm/reject (booking-confirmed/cancelled)
- [x] Implement H-1 reminder email (cron job) — `/api/cron/booking-reminders` daily 18:00 WIB
- [x] Implement tier upgrade email — sudah dari Step 3 di cron `complete-bookings`
- [x] Build in-app notification system — `createNotification()` helper + persisted ke DB
- [x] Notification bell icon di navbar dashboard (sudah dari Step 2 dengan auto-refresh 60s)
- [x] Create notification center page (`/dashboard/notifications`) dengan filter by type
- [x] Build notification list component grouped by type (BOOKING/PAYMENT/PROMO/MEMBERSHIP/SYSTEM) + visual indicator unread
- [x] Implement mark as read / mark all as read (optimistic update + click-through)
- [x] Create API: `GET /api/notifications` (filter type, unread, pagination)
- [x] Create API: `GET /api/notifications/unread-count` (sudah dari Step 2)
- [x] Create API: `PUT /api/notifications/[id]/read`
- [x] Create API: `PUT /api/notifications/read-all`
- [x] Setup cron job: send daily H-1 reminders — `/api/cron/booking-reminders` dengan idempotency
- [x] Setup cron: Expire unpaid bookings — `/api/cron/expire-bookings` every 5 min
- [x] Setup cron: Cleanup old notifications — `/api/cron/cleanup-notifications` weekly (delete read >30 hari)
- [x] Refactor admin payment confirm/reject pakai `createNotification()` (in-app + email)
- [x] Production build pass (47 routes generated)


### 2.4 User Dashboard (Lengkap) ✅ (selesai di Step 5)

- [x] Build profile edit page (nama, phone, avatar) — *selesai Step 2*
- [x] Build change password page — *selesai Step 2*
- [x] Build complete booking history page (upcoming, completed, cancelled tabs) dengan counter per tab + pagination
- [x] Build booking detail page dengan status timeline, payment history, refund history, action buttons
- [x] Build favorites page (save favorite courts for quick booking)
- [x] Implement booking cancellation from dashboard — modal dengan refund preview & form bank info
- [x] Create API: `GET /api/bookings` (sudah ada dari Phase 1, dengan filter status)
- [x] Create API: `GET /api/bookings/[id]` (detail + refund preview)
- [x] Create API: `PUT /api/bookings/[id]/cancel` (auto-create refund record kalau eligible)
- [x] Create API: `GET /api/members/favorites`
- [x] Create API: `POST /api/members/favorites`
- [x] Create API: `DELETE /api/members/favorites/[courtId]`
- [x] Schema: tambah model `Favorite` (User × Court join, unique constraint)
- [x] Helper: `src/lib/refunds.ts` (`calculateRefund`, `bookingStartDate`) — pure function buat unit test mudah
- [x] Components: `BookingStatusBadge`, `BookingStatusTimeline`, `BookingActions`, `CancelBookingDialog`, `FavoriteToggle`
- [x] Production build pass (52 routes)

### 2.5 Refund System ✅ (selesai di Step 6)

- [x] Implement refund calculation logic (H-1: 100%, >3h: 50%, <3h: 0%) — *helper `calculateRefund()` di `src/lib/refunds.ts`*
- [x] Build cancellation modal with refund preview — *selesai Step 5 (`CancelBookingDialog`)*
- [x] Build refund request form (bank details) — *terintegrasi di cancel modal kalau eligible*
- [x] Create user refund history view — *visible di booking detail page (Step 5) + API `GET /api/refunds`*
- [x] Admin: refund management page (`/admin/refunds`) — list dengan stats, filter status, search
- [x] Admin: refund detail page (`/admin/refunds/[id]`) — full info user/booking/payment + action panel
- [x] Admin: approve/reject refund (state machine REQUESTED → APPROVED/REJECTED)
- [x] Admin: mark refund as processed (APPROVED → PROCESSED)
- [x] Create API: `POST /api/refunds` — *auto-create dari user-side cancel di Step 5*
- [x] Create API: `GET /api/refunds` (user)
- [x] Create API: `GET /api/admin/refunds` (admin/staff, filter + search)
- [x] Create API: `GET /api/admin/refunds/[id]` (admin/staff)
- [x] Create API: `PUT /api/admin/refunds/[id]/approve` (admin only)
- [x] Create API: `PUT /api/admin/refunds/[id]/reject` (admin only, butuh alasan)
- [x] Create API: `PUT /api/admin/refunds/[id]/process` (admin only)
- [x] Email notification on refund status change — APPROVED, PROCESSED, REJECTED via `sendRefundProcessedEmail`
- [x] In-app notification on setiap state change
- [x] Production build pass (60 routes)

### 2.6 Gallery & Testimoni Management ✅ (selesai di Step 8)

- [x] Admin: manage court photos (upload, reorder, delete) — `/admin/courts` + `/admin/courts/[id]/photos`
- [x] Admin: manage/moderate reviews (show/hide) — `/admin/reviews` dengan filter visibility + search
- [x] Build review submission form (after completed booking) — `ReviewForm` di booking detail page kalau status COMPLETED & belum ada review
- [x] Create API: `POST /api/reviews` — validate ownership + COMPLETED + auto-award 5 poin (idempotent)
- [x] Create API: `GET /api/reviews?courtId=xxx` — public, includes avg rating + distribution
- [x] Create API: `DELETE /api/reviews/[id]` — owner only, reversal poin
- [x] Create API: `GET /api/admin/reviews` (filter visibility & search)
- [x] Create API: `PUT /api/admin/reviews/[id]` (toggle isVisible)
- [x] Create API: `PUT /api/admin/courts/[id]/photos` (replace photos array)
- [x] Award points for review submission — sudah otomatis di POST /api/reviews
- [x] Add "Reviews" link di admin sidebar
- [x] Components: `StarRating`, `ReviewForm`, `CourtPhotoManager`, `ReviewVisibilityToggle`
- [x] Production build pass (71 routes)

### 2.7 Public Pages Polish ✅ (selesai di Step 8.5 — bonus)

- [x] Halaman `/[locale]/locations` — server component, list semua lokasi aktif dari DB dengan court count, indoor/outdoor split, avg rating, link maps, tombol pilih lokasi
- [x] Halaman `/[locale]/promo` — server component, list promo aktif dengan kode salinable, periode, syarat tier/min booking, cara pakai
- [x] Halaman `/[locale]/faq` — full FAQ ter-grouped per kategori (Booking, Pembayaran, Pembatalan, Membership, Operasional)
- [x] Halaman `/[locale]/contact` — info kontak utama + daftar semua lokasi + sosial media
- [x] Connect `LocationsSection` (landing) ke DB — top 6 lokasi aktif
- [x] Connect `PromoSection` (landing) ke DB — top 3 promo aktif
- [x] Connect `TestimonialSection` (landing) ke DB — top 4 review tertinggi visible
- [x] Connect `GallerySection` (landing) ke DB — aggregate court photos, fallback Unsplash
- [x] Connect `SocialProofBar` (landing) ke DB — real court count, booking count, avg rating
- [x] Buat `GET /api/promos/active` (public)
- [x] Refactor `FAQSection` landing pakai shared `src/lib/faq-data.ts`
- [x] Component `FAQAccordion` reusable
- [x] Production build pass (76 routes)

### 2.8 UX Polish — Smooth scroll + ISR + Loading + Animations ✅

- [x] Smooth scroll di `globals.css` dengan `scroll-padding-top` 80px + respect `prefers-reduced-motion`
- [x] Anchor IDs (`#locations`, `#promo`, `#faq`) di landing sections
- [x] Navbar hybrid + custom scroll handler — di landing pakai `<a>` + native `scrollIntoView({ behavior: smooth })`, di luar landing pakai Link
- [x] Logo + "Beranda" smooth scroll ke top
- [x] ISR cache di public pages (`revalidate = 60`)
- [x] `loading.tsx` skeleton di 4 segment: (auth), (public), dashboard, admin
- [x] Footer: tambah link "Kontak" → `/contact`
- [x] Landing animations: hero text staggered, section reveal-on-scroll, count-up SocialProofBar
- [x] Components `ScrollReveal` + `CountUp` reusable
- [x] Production build pass

### 2.9 UX Bundle "User Friendly + Power + Premium" ✅

- [x] Sticky shrink navbar (72→60px on scroll), parallax hero, floating badges (5 icons)
- [x] Toast notifications via sonner — `showToast.success/error/info/promise` helper
- [x] Toast wired ke 6 forms (login, register, profile, change-password, cancel-booking, submit-review)
- [x] Skeleton shimmer di 4 segment loading.tsx
- [x] **ConfirmDialog** reusable — 3 variant (danger/warning/info), Esc key, async loading
- [x] Apply ConfirmDialog ke recurring booking cancel
- [x] **EmptyState** reusable — 9 variant pre-configured + optional CTA
- [x] Apply EmptyState ke 4 pages: bookings list, favorites, recurring, notifications
- [x] **Tooltip** reusable + apply di RecurringBookingActions
- [x] **ValidatedInput** + validators library (email, phoneId, minLength, password, matches)
- [x] Apply ValidatedInput ke register page
- [x] **DebouncedSearch** + **AdminFilterBar** — search instant via URL params dengan loading spinner
- [x] Apply AdminFilterBar ke 3 admin pages (members, refunds, reviews)
- [x] **Confetti** untuk milestone via canvas-confetti — small (review submit), big (register, redeem)
- [x] All effects honor `prefers-reduced-motion`
- [x] Production build pass

---

### 2.10 Admin Pages Real Data Refactor ✅

- [x] `/admin` overview — connect ke DB: today bookings count + change %, today revenue (sum confirmed payments), pending payments count, occupancy rate (booked hours / total available 16h × courts), today bookings list (max 6), pending payments list (max 5)
- [x] `/admin/bookings` — full list dari DB dengan filter status (6 status) + search via AdminFilterBar, action confirm/reject inline (PENDING_PAYMENT + PENDING_CONFIRMATION saja), pagination
- [x] `/admin/payments` — list dengan tabs pending/confirmed/rejected + counter, full proof image preview (UploadThing) + click to view, action confirm/reject inline, alasan reject inline
- [x] API baru: `PUT /api/admin/bookings/[id]/confirm` (manual confirm tanpa via payment)
- [x] API baru: `PUT /api/admin/bookings/[id]/reject` (dengan alasan, batalkan booking + payment)
- [x] Component `BookingActionButtons` (admin booking row) + `PaymentActionButtons` (admin payment card)
- [x] Login redirect smart: ADMIN/STAFF → `/admin`, USER → `/dashboard`
- [x] Admin Panel link di dashboard sidebar + user dropdown (cuma muncul untuk ADMIN/STAFF)
- [x] Admin layout server-side guard (non-admin auto-redirect)
- [x] Production build pass

- [x] **ConfirmDialog** reusable — modal modern dengan 3 variant (danger/warning/info), Esc key, async-aware loading state
- [x] Apply ConfirmDialog ke recurring booking cancel — replace inline confirm
- [x] **EmptyState** reusable — 9 variant pre-configured (no-bookings, no-favorites, no-notifications, dst) dengan blob illustration + optional CTA
- [x] Apply EmptyState ke 4 pages: bookings list, favorites, recurring, notifications
- [x] **Tooltip** reusable — appear on hover/focus, keyboard accessible, 4 sides
- [x] Apply tooltips di RecurringBookingActions (pause/cancel buttons)
- [x] **ValidatedInput** + validators library — real-time validation dengan checkmark hijau / error icon merah, validation hanya muncul setelah blur
- [x] Apply ValidatedInput ke register page — name, email, phone
- [x] **DebouncedSearch** + **AdminFilterBar** — search instant tanpa tombol submit, sync ke URL, reset pagination otomatis, ada loading spinner
- [x] Apply AdminFilterBar ke 3 admin pages: members, refunds, reviews
- [x] **Confetti** untuk milestone moments via canvas-confetti — small burst untuk review submit, big celebration untuk register sukses + redeem reward
- [x] All effects honor `prefers-reduced-motion`
- [x] Toast wired ke 6 forms (login, register, profile, change-password, cancel-booking, submit-review)
- [x] Sticky shrink navbar (72px → 60px on scroll), parallax hero, floating badges di hero
- [x] Skeleton shimmer di 4 segment (auth/public/dashboard/admin)
- [x] Production build pass

---

## Phase 3 — Advanced (2-3 Minggu) — IN PROGRESS

### 3.0 Settings (App + Payment Methods) ✅ (selesai di Step 15 — admin completion)

- [x] Page `/admin/settings` (replace placeholder) — single page dengan 2 section: App Settings + Payment Methods Manager
- [x] Component `AppSettingsForm` — 3 section (Pembayaran, Refund Policy, Sistem Poin), 9 configurable values total dengan info tooltip per field
- [x] Component `PaymentMethodsManager` — inline create + edit + toggle + delete payment methods, Bank/E-Wallet split
- [x] API `GET /api/admin/settings` — returns flat object dengan defaults filled in untuk missing keys
- [x] API `PUT /api/admin/settings` — bulk upsert via $transaction
- [x] API `GET /api/admin/payment-methods` (list semua active+inactive)
- [x] API `POST /api/admin/payment-methods` (create)
- [x] API `PUT /api/admin/payment-methods/[id]` (partial update)
- [x] API `DELETE /api/admin/payment-methods/[id]` (hard delete)
- [x] Validation `src/lib/validations/settings.ts` — appSettingsSchema (dp%, deadline, refund policy 3 levels, 4 points keys) + paymentMethod schemas
- [x] Production build pass

### 3.0 User & Staff CRUD ✅ (selesai di Step 14 — admin completion)

- [x] Page `/admin/users` (replace placeholder) — list dengan stats per role (Admin/Staff/Customer), filter role, search, action panel
- [x] Page `/admin/users/new` — form create staff baru
- [x] Page `/admin/users/[id]/edit` — form edit (email locked, password optional untuk reset)
- [x] Component `AdminUserForm` reusable — single form untuk create + edit, password show/hide
- [x] Component `AdminUserActionButtons` — edit/deactivate dengan ConfirmDialog, self-protection (tidak bisa nonaktif diri sendiri)
- [x] API `GET /api/admin/users` (default: STAFF + ADMIN, opsional ?role=USER untuk include customer, search, pagination, role counts)
- [x] API `POST /api/admin/users` (create dengan bcrypt hash, unique email check)
- [x] API `GET /api/admin/users/[id]` (detail untuk edit)
- [x] API `PUT /api/admin/users/[id]` — partial update + password reset, **last-admin protection** (tidak bisa demote/deactivate admin terakhir)
- [x] API `DELETE /api/admin/users/[id]` — soft deactivate (preserve history), self + last-admin protection
- [x] Validation `src/lib/validations/admin-user.ts` (create + update schema)
- [x] Production build pass

### 3.0 Pricing CRUD ✅ (selesai di Step 13 — admin completion)

- [x] Page `/admin/pricing` (replace placeholder) — list semua court dengan preview matrix 4-kombinasi (Weekday/Weekend × Regular/Prime), warning kalau harga belum lengkap
- [x] Page `/admin/pricing/[courtId]` — full editor dengan PricingMatrix table
- [x] Component `PricingMatrix` reusable — table editor: select dayType/timeType per row, time picker, rupiah input dengan formatter, toggle isActive, add/remove row
- [x] Default 4 baris standar PRD (Weekday Regular 08-16, Weekday Prime 16-00, Weekend Regular 08-16, Weekend Prime 16-00) untuk court yang belum punya harga
- [x] API `GET /api/admin/pricing` (list courts dengan pricing summary)
- [x] API `GET /api/admin/pricing/[courtId]` (detail full pricing rows)
- [x] API `PUT /api/admin/pricing/[courtId]` — bulk replace (atomic transaction: delete all + insert all baru)
- [x] Validation `src/lib/validations/pricing.ts` — single row + bulk update schema
- [x] Production build pass

### 3.0 Locations CRUD ✅ (selesai di Step 12 — admin completion)

- [x] Page `/admin/locations` (replace placeholder) — grid card per location dengan thumbnail, info, court count, action panel
- [x] Page `/admin/locations/new` — form create dengan UploadThing thumbnail uploader
- [x] Page `/admin/locations/[id]/edit` — form edit pre-fill semua field
- [x] Component `LocationForm` reusable — section-based (Info Dasar, Kontak, Operasional, Geografis & Foto), thumbnail upload via UploadThing endpoint `locationThumbnail`
- [x] Component `LocationActionButtons` — edit/toggle/delete dengan ConfirmDialog, smart delete (hard kalau no courts, soft cascade kalau ada)
- [x] API `GET /api/admin/locations` (list + filter status + search + pagination)
- [x] API `POST /api/admin/locations` (create, admin only)
- [x] API `GET /api/admin/locations/[id]` (detail dengan court list)
- [x] API `PUT /api/admin/locations/[id]` (partial update)
- [x] API `DELETE /api/admin/locations/[id]` (smart delete strategy)
- [x] Validation `src/lib/validations/location.ts` (name, address, city required, jam operasional HH:mm regex, lat/lng range, email format)
- [x] Production build pass

### 3.2 Promo & Event Management ✅ (selesai di Step 11)

- [x] Page `/admin/promos` (replace placeholder) — list dengan stats (active/expired/inactive), filter status, search via AdminFilterBar, action panel (edit/toggle/delete)
- [x] Page `/admin/promos/new` — form create dengan default 7-day periode
- [x] Page `/admin/promos/[id]/edit` — form edit dengan pre-fill semua field
- [x] Component `PromoForm` reusable — single form untuk create + edit, validation client + server, organize by section (Info, Diskon, Periode, Eligibilitas)
- [x] Component `PromoActionButtons` — inline edit/toggle/delete dengan ConfirmDialog
- [x] API `GET /api/admin/promos` (list + stats + filter status + search)
- [x] API `POST /api/admin/promos` (create dengan unique code check)
- [x] API `GET /api/admin/promos/[id]` (detail untuk edit)
- [x] API `PUT /api/admin/promos/[id]` (partial update)
- [x] API `DELETE /api/admin/promos/[id]` (hard-delete kalau usageCount=0, soft-delete kalau ada history)
- [x] Validation `src/lib/validations/promo.ts` dengan refinements (PERCENTAGE 1-100, endDate > startDate)
- [x] Production build pass

### 3.1 Laporan & Analytics (Admin)

- [x] Create reports page (`/admin/reports`)
- [x] Build revenue report (daily/weekly/monthly chart)
- [x] Build occupancy rate report (per court, per time slot)
- [x] Build member growth report (registrations over time)
- [x] Build top courts report (most booked)
- [x] Build cancellation rate report
- [x] Create API: `GET /api/admin/reports/revenue`
- [x] Create API: `GET /api/admin/reports/occupancy`
- [x] Create API: `GET /api/admin/reports/members`
- [x] Add date range filter for all reports
- [x] Export report to CSV (optional)

### 3.2 Promo & Event Management ✅ (duplikat — semua selesai di Step 11, lihat section di atas)

- [x] Admin: create promo page (code, discount, conditions, period) — done di Step 11 (`src/app/[locale]/admin/promos/new/page.tsx`)
- [x] Admin: list/edit/deactivate promos — done di Step 11 (`admin/promos/page.tsx` + `[id]/edit` + `PromoActionButtons`)
- [x] Implement promo validation logic (min booking, usage limit, member-only, tier requirement) — done di Step 11 (`src/lib/promos.ts` `validateDiscountCode()` + `POST /api/promos/validate`)
- [x] Build promo display on public promo page — done di Step 11 (`src/app/[locale]/(public)/promo/page.tsx`)
- [x] Create API: `GET /api/promos/active` — done di Step 11 (`src/app/api/promos/active/route.ts`)
- [x] Create API: `GET /api/admin/promos` — done di Step 11 (`src/app/api/admin/promos/route.ts`)
- [x] Create API: `POST /api/admin/promos` — done di Step 11 (same file)
- [x] Create API: `PUT /api/admin/promos/[id]` — done di Step 11 (`src/app/api/admin/promos/[id]/route.ts`)
- [x] Create API: `DELETE /api/admin/promos/[id]` — done di Step 11 (same file, hard-delete kalau usageCount=0)

### 3.3 Penukaran Poin (Reward Store) ✅ (selesai bertahap, redemption usage di Step 16)

- [x] Build reward store page in user dashboard — *selesai Step 3*
- [x] Create reward catalog (discounts, free sessions, merchandise) — *selesai Step 3 di `src/lib/rewards.ts`*
- [x] Implement redemption flow (select reward → confirm → deduct points) — *selesai Step 3*
- [x] Generate discount code on redemption — *`JF-XXXXXX` format, selesai Step 3*
- [x] **Redemption usage di booking flow** — kode bisa dipakai checkout, atomic transaction (deduct + mark used + idempotent)
- [x] **Promo + Redemption unified** via `validateDiscountCode()` helper di `src/lib/promos.ts`
- [x] Admin: manage reward catalog — full CRUD di `/admin/rewards` dengan model `Reward` + smart delete (hard kalau `redemptionCount=0`, soft kalau ada history)
- [x] Track redemption history — *selesai Step 3, plus `usedAt + usedBookingId` saat dipakai*

### 3.4 Referral System ✅ (selesai)

- [x] Generate unique referral code per user — `src/lib/referrals.ts` (`generateReferralCode`, `ensureReferralCode` format `JF-XXXXXX`, retry on collision); auto-assigned saat register di `POST /api/auth/register` + lazy backfill saat akses `/dashboard/referral`
- [x] Build referral sharing UI (copy link, share to WhatsApp) — `/dashboard/referral` page + `ReferralShareCard` client component (copy code/link dengan fallback execCommand, WhatsApp + Telegram + native Web Share API)
- [x] Track referral registrations — `User.referredById` + `applyReferralOnRegister()` dipanggil di register API; register page baca `?ref=CODE` dan prefill field referral
- [x] Award points when referee completes first booking — `awardReferralBonusOnFirstBooking()` dipanggil di cron `/api/cron/complete-bookings` (idempotent via `EARNED_REFERRAL` + `referenceId` lookup, +20 poin per referral)
- [x] Build referral dashboard (referral count, points earned) — `/dashboard/referral` server page: stats (total/successful/points), recent 10 referees dengan status badge + points, "How it works" section, link ke membership; `GET /api/members/referrals` endpoint untuk client integrations

### 3.5 SEO Optimization

- [x] Add meta tags to all public pages
- [x] Implement Open Graph tags (for social sharing)
- [x] Add structured data (LocalBusiness, SportsActivityLocation)
- [x] Generate sitemap.xml
- [x] Create robots.txt
- [x] Optimize page titles & descriptions per locale
- [x] Implement canonical URLs

### 3.6 Performance Tuning ✅ (selesai di Phase 3 perf pass)

- [x] Implement ISR for landing page, locations, courts — landing/locations/promo `revalidate=60`, contact/faq/sitemap `revalidate=3600`; dashboard/admin tetap `force-dynamic`
- [x] Optimize images (WebP, proper sizing, lazy load) — `next.config.mjs` `formats: ["image/avif", "image/webp"]` + locked `remotePatterns` (utfs.io, *.uploadthing.com, *.utfs.io, images.unsplash.com, lh3.googleusercontent.com); replace `<img>` di CourtsSection + booking flow → `next/image` dengan `fill`+`sizes`+`loading="lazy"`
- [x] Code splitting (dynamic imports for heavy components) — `src/components/admin/reports/LazyCharts.tsx` lazy-load recharts (~80KB) via `next/dynamic({ ssr: false })` dengan skeleton; reports page First Load JS 90.6 kB (turun signifikan dari direct-import baseline)
- [x] Database query optimization (check slow queries) — audit `/api/bookings`, `/api/admin/bookings`, `/api/courts/[id]/availability`, `/api/admin/members`: sudah pakai `Promise.all` untuk parallel reads + `select` di hot paths (members route trims user fields); availability route pakai `select { startTime, endTime, status }` di booking lookup; tidak ada N+1
- [x] Add proper indexes to frequently queried columns — `prisma/migrations/20260603000000_add_perf_indexes/migration.sql` dengan 13 index `IF NOT EXISTS`: User (role+isActive, tier), Booking (status+date), Payment (booking, status+createdAt), Refund (user+status, status+createdAt), PointsHistory (user+type, user+createdAt), Review (court+visible, user), Promo (active+endDate); schema.prisma diupdate, `prisma generate` sukses
- [x] Lighthouse audit → target score > 90 — `LIGHTHOUSE.md` dokumentasi lengkap; root layout tambah `viewport` export + `<link rel="preconnect">` untuk utfs.io & images.unsplash.com; theme color set untuk address bar
- [x] Bundle size analysis & reduction — `@next/bundle-analyzer` terinstall + wired di `next.config.mjs` (`ANALYZE=true npm run build`); semua `lucide-react` import sudah individual (named imports, tree-shake friendly); shared chunks 87.7 kB; landing route 93.2 kB First Load JS

---

## Audit Spec vs Implementasi (akhir Phase 3)

> Cross-check antara `JayField-PRD.md`, `design.md`, `requirements.md` dan codebase yang sebenarnya. Dilakukan setelah Phase 3 ditandai selesai.

### Critical/Major gap yang DIPERBAIKI di pass ini

- [x] **Booking flow pages pakai mock data hardcoded** — `/booking`, `/booking/[locationId]`, `/booking/[locationId]/[courtId]`, dan `/booking/confirm` semuanya pakai static array (loc-1/2/3, court-1..12) dan tidak pernah memanggil `POST /api/bookings`. Diganti jadi server component yang baca Prisma, plus `BookingConfirmForm` client yang nge-POST ke `/api/bookings` dan redirect ke `/dashboard/bookings/[id]` buat upload bukti via `PaymentProofUploader`.
- [x] **Schedule picker pakai slot mock** — `[courtId]/page.tsx` lama generate slot statis dengan random "booked" hardcoded di hour 17/18. Diganti jadi `ScheduleSlotPicker` client yang fetch ke `/api/courts/[id]/availability?date=...` dengan validasi slot kontigu.
- [x] **Payment methods di confirm page hardcoded BCA/BNI/Mandiri/BRI/Dana/OVO/GoPay** — sekarang baca dari `prisma.paymentMethod` aktif (sortOrder).
- [x] **Promo logic mock** (cek string "JAYFIELD10" di client) — sekarang panggil `POST /api/promos/validate` yang pakai `validateDiscountCode()` (support promo + redemption code unified).
- [x] **`/api/auth/forgot-password` cuma `console.log` token** — wired ke `sendPasswordResetEmail` (no-op tanpa RESEND_API_KEY, jadi tetap aman di local).
- [x] **Rate limiting (NFR §5.4 Security) tidak ada** — tambah `src/lib/rate-limit.ts` (in-memory fixed window) + apply ke `/api/auth/register`, `/api/auth/forgot-password`, dan `/api/bookings` POST. Return HTTP 429 + `Retry-After` header.

### Minor (catat saja, tidak diperbaiki)

- PRD §6 sitemap pakai `/auth/login`, `/auth/register`, `/auth/forgot-password`. Codebase pakai `/login`, `/register`, `/forgot-password` (tanpa prefix `/auth`). Pattern tanpa prefix lebih clean dan konsisten di seluruh internal link, jadi dibiarkan.
- Rate limiter sekarang in-memory (per-isolate). Untuk production multi-region yang ketat, ganti ke Upstash/Redis-based — interface `checkRateLimit` sudah dibuat compatible.
- WCAG 2.1 AA compliance (NFR §5.5) butuh manual audit dengan screen reader + Lighthouse Accessibility (sudah didokumentasikan di `LIGHTHOUSE.md`).

---

## UX Upgrade Pass — Tier 1 & Tier 2 (Mei 2026)

> Pasca audit, dilakukan dua sprint UX upgrade untuk make user merasa lebih nyaman, smooth, dan modern. Semua upgrade honor `prefers-reduced-motion`, type-check clean, build pass.

### Tier 1 — High impact, mudah

- [x] **Booking Stepper** (`src/components/booking/BookingStepper.tsx`) — visual 4-step indicator (Lokasi → Lapangan → Jadwal → Bayar) dipasang di 4 booking pages. Mobile compact + counter, desktop full pills dengan icon & connector line.
- [x] **Loading skeleton spesifik** (`src/app/[locale]/booking/loading.tsx`) — match layout final supaya transisi feel smooth (visual continuity).
- [x] **Empty State lebih hidup** (`src/components/shared/EmptyState.tsx`) — animate-pulse + float + ring glow + copy lebih friendly ("Lapangan masih kosong nih, yuk pesan sebelum keduluan teman 😎").
- [x] **Inline Field Hints** (`src/components/shared/FieldHint.tsx`) — apply di register (email + phone) dan booking confirm (promo code).
- [x] **Sticky Mobile CTA** (`src/components/shared/StickyMobileCta.tsx`) — di booking confirm page, tombol "Konfirmasi" + total price pinned di bottom screen dengan safe-area-inset-bottom.
- [x] **OAuth fix** — `isGoogleOAuthEnabled` di `src/lib/auth.ts` auto-detect env, tombol Google login di-hide kalau credentials kosong (mencegah error `OAuthSignin`).

### Tier 2 — High impact, medium effort

- [x] **BookingSuccessCard** (`src/components/booking/BookingSuccessCard.tsx`) — premium card di booking detail saat status CONFIRMED, berisi: QR code (collapsible), Add to Calendar (download .ics), Google Calendar URL, WhatsApp share, native share API, copy booking ID. Dependency baru: `qrcode`.
- [x] **Live Countdown** (`src/components/shared/Countdown.tsx`) — di sidebar booking detail saat PENDING_PAYMENT, angka besar yang berubah warna muted → warning → error mendekati deadline.
- [x] **Booking Status Timeline upgrade** (`src/components/dashboard/BookingStatusTimeline.tsx`) — vertical connector line filled, pulse animation di current step, hint text per stage ("Biasanya < 1 jam", "Siap main!", "Poin masuk otomatis").
- [x] **Smart Date Picker** (`src/components/booking/ScheduleSlotPicker.tsx`) — header Sat/Sun + tanggal weekend kelihatan beda (warna oranye + dot indicator), legend "Weekend cenderung lebih ramai".
- [x] **Real-time Slot Availability** — silent polling tiap 15 detik, slot otomatis refresh kalau dibooking user lain (reduce booking conflict frustration).
- [x] **Search Auto-suggest** (`src/components/booking/BookingLocationSearch.tsx` + `src/app/api/locations/suggest/route.ts`) — dropdown dengan keyboard navigation (↑↓ Enter Esc), klik langsung navigate ke `/booking/[locationId]`.
- [x] **Image Lightbox** (`src/components/shared/Lightbox.tsx` + `src/components/landing/GalleryGrid.tsx`) — full-screen modal dengan keyboard nav, counter, body scroll lock, click backdrop to close. Apply ke landing GallerySection.
- [x] **Calendar Export Helper** (`src/lib/calendar-export.ts`) — `buildBookingIcs`, `downloadIcs`, `googleCalendarUrl`. Standar RFC 5545 dengan VALARM 1 jam sebelum.

### Tier 2 yang DI-SKIP intentionally

- [~] **Onboarding Tour** — diskusi dengan user, decision: skip. Booking flow sudah linear & jelas dengan Stepper, tour modal sering dianggap mengganggu (completion rate 10-30%). Pakai approach ringan: stepper + empty state actionable + FieldHint + smart defaults.

### Tier 3+ (backlog, opsional untuk masa depan)

- [ ] Page transitions smooth (framer-motion / view transitions API)
- [ ] Floating mini "booking cart" tracker
- [ ] Voucher card design realistic untuk reward redemption
- [ ] Smart booking reminder (cuaca, jarak ke lokasi, packing tips)
- [ ] Voice search di mobile
- [ ] Streak / gamification badge
- [ ] Achievements collection
- [ ] Friends & group booking
- [ ] Leaderboard top member
- [ ] Live chat widget
- [ ] Personalized push promo



> Cross-check antara `JayField-PRD.md`, `design.md`, `requirements.md` dan codebase yang sebenarnya.
> Jalan tanggal akhir Phase 3 setelah semua task ditandai `[x]`.

### Critical/Major gap yang DIPERBAIKI di pass ini

- [x] **Booking flow pages pakai mock data hardcoded** — `/booking`, `/booking/[locationId]`, `/booking/[locationId]/[courtId]`, dan `/booking/confirm` semuanya pakai static array (loc-1/2/3, court-1..12) dan tidak pernah memanggil `POST /api/bookings`. Diganti jadi server component yang baca Prisma, plus `BookingConfirmForm` client yang nge-POST ke `/api/bookings` dan redirect ke `/dashboard/bookings/[id]` buat upload bukti via `PaymentProofUploader`.
- [x] **Schedule picker pakai slot mock** — `[courtId]/page.tsx` lama generate slot statis dengan random "booked" hardcoded di hour 17/18. Diganti jadi `ScheduleSlotPicker` client yang fetch ke `/api/courts/[id]/availability?date=...` dengan validasi slot kontigu.
- [x] **Payment methods di confirm page hardcoded BCA/BNI/Mandiri/BRI/Dana/OVO/GoPay** — sekarang baca dari `prisma.paymentMethod` aktif (sortOrder).
- [x] **Promo logic mock** (cek string "JAYFIELD10" di client) — sekarang panggil `POST /api/promos/validate` yang pakai `validateDiscountCode()` (support promo + redemption code unified).
- [x] **`/api/auth/forgot-password` cuma `console.log` token** (TODO comment) — wired ke `sendPasswordResetEmail` (no-op tanpa RESEND_API_KEY, jadi tetap aman di local).
- [x] **Rate limiting (NFR §5.4 Security) tidak ada** — tambah `src/lib/rate-limit.ts` (in-memory fixed window) + apply ke `/api/auth/register`, `/api/auth/forgot-password`, dan `/api/bookings` POST. Return HTTP 429 + `Retry-After` header.

### Minor (catat saja, tidak diperbaiki)

- PRD §6 sitemap pakai `/auth/login`, `/auth/register`, `/auth/forgot-password`. Codebase pakai `/login`, `/register`, `/forgot-password` (tanpa prefix `/auth`). Pattern tanpa prefix lebih clean dan konsisten di seluruh internal link, jadi dibiarkan.
- Rate limiter sekarang in-memory (per-isolate). Untuk production multi-region yang ketat, ganti ke Upstash/Redis-based — interface `checkRateLimit` sudah dibuat compatible.
- WCAG 2.1 AA compliance (NFR §5.5) butuh manual audit dengan screen reader + Lighthouse Accessibility (sudah didokumentasikan di `LIGHTHOUSE.md`).
- Cookie consent banner (catatan tambahan §11) belum ada — biasanya butuh keputusan legal, bukan technical.
- GDPR data deletion request (§11) belum ada endpoint khusus; admin bisa hapus user manual via `/admin/users`.

### Verifikasi build akhir
- `npx prisma generate` — ✓
- `npx tsc --noEmit` — ✓ exit 0
- `npm run build` — ✓ exit 0

---



### 4.1 Payment Gateway Integration
- [~] Integrate Midtrans or Xendit
- [~] Implement auto-confirmation on successful payment
- [~] Remove manual transfer flow (or keep as alternative)

### 4.2 WhatsApp Notification
- [~] Integrate WhatsApp Business API (e.g., Fonnte, Wablas)
- [~] Send booking confirmation via WA
- [~] Send H-1 reminder via WA
- [~] Send payment reminder via WA

### 4.3 Mobile App
- [x] Create React Native app (or PWA) — full PWA support: `src/app/manifest.ts` + `public/sw.js` (vanilla Cache API, network-first untuk API GET, stale-while-revalidate untuk static), offline page `/[locale]/offline`, install prompt banner via `beforeinstallprompt` (7-day dismiss), update toast via SW `controllerchange`, NetworkStatus indicator. Wired di `src/app/[locale]/layout.tsx` via `ServiceWorkerProvider` (production-only). Apple Web App meta + maskable icons referenced.
- [x] Push notifications — web-push integration dengan VAPID. Schema: `PushSubscription` model + migration `20260604000000_add_push_subscriptions`. Helper `src/lib/push.ts` (`sendPushNotification`, auto-prune 404/410). API `POST/GET/DELETE /api/notifications/subscribe`. Client toggle `PushNotificationToggle` di `/dashboard/profile`. SW `push` + `notificationclick` handlers. `createNotification()` auto-fan-out (best-effort, opt-out via `push: false`). VAPID generator script `scripts/generate-vapid-keys.ts` + `npm run vapid:generate`. Setup docs di `PWA.md`.
- [x] Offline booking history — SW network-first dengan cache fallback untuk `/api/bookings`, `/api/members/profile`, `/api/notifications`. Pre-cache `/id`, `/en`, dan offline pages. `src/lib/offline-cache.ts` (versioned localStorage envelope, per-user namespace) + `BookingsOfflineCache` client island menyimpan snapshot booking saat online lalu surface banner kalau SSR gagal saat offline. NetworkStatus indicator pill saat `navigator.onLine === false`.

### 4.4 Additional Features
- [~] Chatbot (FAQ auto-response)
- [~] Google Calendar integration (add booking to calendar)
- [x] Dark mode — system-aware toggle dengan localStorage persistence + FOUC-free SSR
- [~] Multi-language expansion (add English variants)
- [~] Advanced analytics (heatmap, user behavior)

---

## Admin CRUD Tasks (Ongoing)

### Court Management
- [x] Admin: create court page (form with photo upload)
- [x] Admin: edit court page
- [x] Admin: deactivate/delete court
- [x] Create API: `POST /api/courts`
- [x] Create API: `PUT /api/courts/[id]`
- [x] Create API: `DELETE /api/courts/[id]`

### Location Management
- [x] Admin: create location page
- [x] Admin: edit location page
- [x] Admin: deactivate/delete location
- [x] Create API: `POST /api/locations`
- [x] Create API: `PUT /api/locations/[id]`
- [x] Create API: `DELETE /api/locations/[id]`

### Pricing Management
- [x] Admin: pricing page (set price per court, day type, time type)
- [x] Admin: bulk price update
- [x] Create API for pricing CRUD

### User/Staff Management
- [x] Admin: create staff account
- [x] Admin: list users/staff
- [x] Admin: change user role
- [x] Admin: deactivate user
- [x] Create API: `GET /api/admin/users`
- [x] Create API: `POST /api/admin/users`
- [x] Create API: `PUT /api/admin/users/[id]`
- [x] Create API: `DELETE /api/admin/users/[id]`

### Settings
- [x] Admin: settings page (DP percentage, payment deadline, refund policy, bank accounts)
- [x] Create API: `GET /api/admin/settings`
- [x] Create API: `PUT /api/admin/settings`

---

## Scheduled Jobs (Cron)

- [x] Setup cron: Expire unpaid bookings (every 5 minutes) — *endpoint `/api/cron/expire-bookings` aktif*
- [x] Setup cron: Send H-1 booking reminders (daily at 18:00 WIB) — *endpoint `/api/cron/booking-reminders` aktif*
- [x] Setup cron: Complete bookings + award points (every 30 min) — *endpoint `/api/cron/complete-bookings` aktif (NEW)*
- [x] Setup cron: Generate recurring bookings (daily at 00:01 WIB) — *endpoint `/api/cron/generate-recurring` aktif*
- [x] Setup cron: Cleanup old notifications (weekly) — *endpoint `/api/cron/cleanup-notifications` aktif*

---

## Deployment

- [~] Setup Vercel project
- [~] Setup production database (Supabase/Railway/Neon)
- [~] Configure environment variables di Vercel
- [~] Setup custom domain (when ready)
- [~] Setup SSL certificate (auto via Vercel)
- [~] Configure Vercel Cron Jobs
- [~] Setup database backup strategy
- [~] First production deployment
- [~] Smoke test semua flow di production

---

*Total estimated tasks: ~200+ items*
*Prioritas: Phase 1 → Phase 2 → Phase 3 → Phase 4*

**Dibuat:** 28 Mei 2026
**Versi:** 1.1 (updated 29 Mei 2026 — Phase 2 foundation completed)
**Referensi:** JayField-PRD.md, requirements.md, design.md
