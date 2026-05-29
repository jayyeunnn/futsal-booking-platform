# PRD (Product Requirements Document)
# JayField — Website Booking Lapangan Futsal

---

## 1. Overview

### 1.1 Nama Produk
**JayField**

### 1.2 Deskripsi Singkat
JayField adalah platform web booking lapangan futsal multi-lokasi yang memungkinkan pengguna untuk mencari, memilih, dan memesan lapangan futsal secara online dengan sistem pembayaran DP via transfer manual. Platform ini dilengkapi dengan sistem membership berbasis poin & tier, dashboard admin untuk pengelolaan operasional, serta landing page yang modern dan sporty.

### 1.3 Tujuan Produk
- Memudahkan pelanggan untuk booking lapangan futsal kapan saja dan di mana saja
- Mengoptimalkan penggunaan lapangan (reduce idle time)
- Membangun loyalitas pelanggan melalui sistem member
- Mempermudah pengelolaan bisnis bagi owner dan staff

### 1.4 Target User
| User Type | Deskripsi |
|-----------|-----------|
| **Pelanggan Umum** | Siapa saja yang ingin booking lapangan futsal |
| **Member** | Pelanggan terdaftar yang mendapatkan benefit eksklusif |
| **Admin/Owner** | Pemilik bisnis yang mengelola seluruh operasional |
| **Staff** | Karyawan yang membantu konfirmasi booking & pembayaran |

---

## 2. Tech Stack

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| Framework | Next.js 14 (App Router) | Full-stack, SEO-friendly, SSR/SSG |
| Language | TypeScript | Type-safe, maintainable |
| Styling | Tailwind CSS | Rapid development, responsive |
| UI Components | shadcn/ui | Modern, accessible, customizable |
| Backend/API | Next.js API Routes + Prisma | Integrated, type-safe ORM |
| Database | PostgreSQL | Reliable, relational, cocok untuk booking system |
| Authentication | NextAuth.js | Google OAuth, credentials, session management |
| Hosting | Vercel (frontend) + Supabase/Railway (DB) | Scalable, free tier available |
| Email | Resend / Nodemailer | Transactional email notifications |
| Language/i18n | next-intl | Bilingual support (ID & EN) |

---

## 3. Fitur & Modul

---

### 3.1 Landing Page (Public)

**Vibe:** Modern, Sporty, Minimalis

**Sections:**

| # | Section | Deskripsi |
|---|---------|-----------|
| 1 | **Hero** | Headline menarik + CTA "Book Sekarang" + background image lapangan |
| 2 | **Info Lapangan & Fasilitas** | Jenis lapangan (indoor/outdoor), fasilitas (parkir, mushola, kantin, dll) |
| 3 | **Lokasi** | Daftar multi-lokasi dengan peta |
| 4 | **Harga/Paket** | Tabel harga per jam (prime-time vs regular) |
| 5 | **Gallery** | Foto-foto lapangan dan fasilitas |
| 6 | **Promo/Event** | Promo terkini, info turnamen |
| 7 | **Testimoni** | Review dari pelanggan |
| 8 | **FAQ** | Pertanyaan umum (jam operasional, cara booking, kebijakan batal) |
| 9 | **Social Proof** | Jumlah booking, rating, partner |
| 10 | **Footer** | Kontak, social media, link navigasi |

**Warna Palet (Sporty):**
- Primary: `#1B5E20` (Dark Green)
- Secondary: `#212121` (Almost Black)
- Accent: `#4CAF50` (Vibrant Green)
- Background: `#FAFAFA` (Off-white)
- Text: `#1A1A1A` (Dark)
- CTA: `#FF6D00` (Orange — energetic, stand-out)

**Typography:**
- Heading: Bold, sans-serif (Inter/Montserrat)
- Body: Clean, readable (Inter)

---

### 3.2 Authentication System

| Fitur | Deskripsi |
|-------|-----------|
| Register | Via email + password atau Google OAuth |
| Login | Email + password / Google |
| Forgot Password | Reset via email |
| Profile | Edit nama, nomor HP, foto |
| Session Management | Auto logout, remember me |

**Flow dibuat semudah mungkin** — user bisa login via Google dengan 1 klik.

---

### 3.3 Booking System

#### 3.3.1 Flow Booking

```
Pilih Lokasi → Pilih Lapangan → Pilih Tanggal & Jam → 
Isi Data → Konfirmasi → Bayar DP → Menunggu Konfirmasi Admin → Booking Confirmed
```

#### 3.3.2 Detail Fitur

| Fitur | Deskripsi |
|-------|-----------|
| **Pilih Lokasi** | List lokasi dengan filter/search |
| **Pilih Lapangan** | Lihat tipe (indoor/outdoor), foto, fasilitas |
| **Kalender Ketersediaan** | Visual calendar dengan slot tersedia (hijau), terbooked (merah), pending (kuning) |
| **Durasi Fleksibel** | User bisa pilih 1 jam, 1.5 jam, 2 jam, dst |
| **Jam Operasional** | 08:00 - 00:00 (midnight) |
| **Booking Berulang** | Opsi recurring: setiap minggu di hari & jam yang sama |
| **Konfirmasi Booking** | Summary sebelum bayar (lokasi, lapangan, tanggal, jam, harga, DP) |

#### 3.3.3 Sistem Pembayaran

| Item | Detail |
|------|--------|
| **Tipe Pembayaran** | User memilih: **DP (Down Payment)** atau **Bayar Full** |
| **Jumlah DP** | 50% dari total harga (configurable oleh admin) |
| **Bayar Full** | 100% dari total harga — tidak perlu pelunasan di tempat |
| **Metode** | Transfer manual (BCA, BNI, Mandiri, BRI, Dana, OVO, GoPay) |
| **Flow** | User pilih tipe (DP/Full) → pilih metode → dapat nomor rekening/VA → upload bukti transfer → admin konfirmasi |
| **Batas Waktu** | 1 jam untuk upload bukti pembayaran (auto-cancel jika lewat) |
| **Pelunasan (jika DP)** | Sisa pembayaran dilakukan di tempat saat datang |
| **Benefit Bayar Full** | Prioritas konfirmasi, tidak perlu repot bayar di tempat |

#### 3.3.4 Kebijakan Pembatalan & Refund

| Waktu Pembatalan | Refund |
|------------------|--------|
| H-1 (>24 jam sebelum) | 100% DP dikembalikan |
| Di hari H, >3 jam sebelum | 50% DP dikembalikan |
| <3 jam sebelum jadwal | Tidak ada refund |

Proses refund: Admin review → approve → transfer balik ke rekening user (1-3 hari kerja).

---

### 3.4 Membership System

#### 3.4.1 Pendaftaran Member
- **Gratis** — otomatis menjadi member saat register akun
- Semua user terdaftar = member Bronze

#### 3.4.2 Tier System

| Tier | Syarat | Benefit |
|------|--------|---------|
| **Bronze** | Daftar akun | Collect poin, akses promo member |
| **Silver** | 15 booking atau 500 poin | Diskon 10%, priority booking H+1 di jam prime-time |
| **Gold** | 30 booking atau 1500 poin | Diskon 20%, priority booking H+2, free extra time 15 menit, undangan event eksklusif |

#### 3.4.3 Poin System

| Aksi | Poin |
|------|------|
| Setiap booking selesai | +10 poin per jam |
| Review/testimoni | +5 poin |
| Referral (ajak teman daftar & booking) | +20 poin |
| Booking di jam sepi (08:00-16:00) | +5 bonus poin |

#### 3.4.4 Penukaran Poin

| Reward | Poin Dibutuhkan |
|--------|-----------------|
| Diskon 10% (1x booking) | 100 poin |
| Diskon 25% (1x booking) | 200 poin |
| Free 1 sesi (1 jam) | 500 poin |
| Merchandise JayField | 300 poin |

---

### 3.5 Notification System

#### 3.5.1 Email Notification

| Trigger | Isi Email |
|---------|-----------|
| Booking berhasil dibuat | Detail booking + instruksi pembayaran |
| Pembayaran dikonfirmasi | Konfirmasi booking final |
| Reminder H-1 | Pengingat jadwal besok |
| Booking dibatalkan | Status refund |
| Refund diproses | Konfirmasi refund |
| Naik tier member | Selamat + benefit baru |
| Promo/event | Info promo terbaru (opt-in) |

#### 3.5.2 In-App Notification

- Bell icon di navbar (saat login)
- Badge count untuk unread notifications
- Notification center (list semua notifikasi)
- Kategori: Booking, Pembayaran, Promo, System

---

### 3.6 Admin Dashboard

#### 3.6.1 Akses & Role

| Role | Akses |
|------|-------|
| **Owner/Super Admin** | Full access semua fitur |
| **Staff** | Konfirmasi booking & pembayaran, lihat jadwal |

#### 3.6.2 Fitur Dashboard

| Modul | Fitur |
|-------|-------|
| **Overview/Home** | Total booking hari ini, pendapatan hari/bulan ini, lapangan paling laris, occupancy rate |
| **Manajemen Booking** | List semua booking, filter by status/lokasi/tanggal, approve/reject, reschedule |
| **Konfirmasi Pembayaran** | List bukti transfer masuk, approve/reject dengan 1 klik |
| **Manajemen Lapangan** | CRUD lapangan (nama, tipe, foto, harga, fasilitas), atur jadwal khusus (maintenance, event) |
| **Manajemen Lokasi** | CRUD lokasi (alamat, jam operasional, kontak) |
| **Manajemen Harga** | Set harga per jam, harga prime-time vs regular, harga weekend vs weekday |
| **Manajemen Member** | List member, lihat tier & poin, adjust poin manual |
| **Manajemen Promo** | Buat/edit promo, set periode, set diskon |
| **Laporan** | Pendapatan (harian/mingguan/bulanan), occupancy rate, member growth, lapangan terlaris |
| **Manajemen Refund** | List request refund, approve/reject, update status |
| **Manajemen User/Staff** | Tambah/hapus staff, atur role/permission |
| **Settings** | Persentase DP, batas waktu pembayaran, kebijakan refund, info rekening bank |

---

### 3.7 User Dashboard (Member Area)

| Fitur | Deskripsi |
|-------|-----------|
| **Riwayat Booking** | List semua booking (upcoming, completed, cancelled) |
| **Booking Aktif** | Detail booking yang akan datang |
| **Status Pembayaran** | Track status DP & pelunasan |
| **Profil & Akun** | Edit data diri, ubah password |
| **Membership Info** | Tier saat ini, total poin, progress ke tier berikutnya |
| **Poin History** | Log poin masuk & keluar |
| **Tukar Poin** | Redeem reward dengan poin |
| **Notifikasi** | Notification center |
| **Booking Berulang** | Kelola recurring booking |
| **Favorit** | Lapangan favorit untuk quick booking |

---

## 4. Bilingual (i18n)

| Aspek | Detail |
|-------|--------|
| **Bahasa** | Indonesia (default) & English |
| **Switcher** | Toggle di navbar |
| **Scope** | Semua UI text, email template, notifikasi |
| **URL** | `/id/...` dan `/en/...` (locale prefix) |

---

## 5. Non-Functional Requirements

### 5.1 Performance
- Landing page load < 3 detik
- Time to Interactive (TTI) < 5 detik
- Lighthouse score > 90

### 5.2 Responsiveness
- Mobile-first design
- Breakpoints: Mobile (< 768px), Tablet (768-1024px), Desktop (> 1024px)
- Touch-friendly UI di mobile

### 5.3 SEO
- Server-side rendering untuk landing page
- Meta tags, Open Graph, structured data
- Sitemap & robots.txt
- URL yang SEO-friendly

### 5.4 Security
- HTTPS everywhere
- Input validation & sanitization
- Rate limiting pada API
- CSRF protection
- Secure session management
- Password hashing (bcrypt)

### 5.5 Accessibility
- WCAG 2.1 Level AA
- Keyboard navigable
- Screen reader compatible
- Sufficient color contrast

---

## 6. Sitemap / Halaman

```
JayField
├── / (Landing Page)
├── /booking
│   ├── /booking/[locationId] (Pilih Lapangan)
│   ├── /booking/[locationId]/[courtId] (Pilih Jadwal)
│   └── /booking/confirm (Konfirmasi & Bayar)
├── /auth
│   ├── /auth/login
│   ├── /auth/register
│   └── /auth/forgot-password
├── /dashboard (User/Member Area)
│   ├── /dashboard/bookings
│   ├── /dashboard/membership
│   ├── /dashboard/points
│   ├── /dashboard/notifications
│   ├── /dashboard/profile
│   └── /dashboard/favorites
├── /admin (Admin Dashboard)
│   ├── /admin/overview
│   ├── /admin/bookings
│   ├── /admin/payments
│   ├── /admin/courts
│   ├── /admin/locations
│   ├── /admin/pricing
│   ├── /admin/members
│   ├── /admin/promos
│   ├── /admin/reports
│   ├── /admin/refunds
│   ├── /admin/users
│   └── /admin/settings
├── /locations (List Lokasi)
├── /promo (Promo & Event)
├── /faq
└── /contact
```

---

## 7. Database Schema (High-Level)

### Tabel Utama:

| Tabel | Deskripsi |
|-------|-----------|
| `users` | Data user (email, password, name, phone, role, tier, points) |
| `locations` | Lokasi lapangan (nama, alamat, jam operasional, kontak) |
| `courts` | Lapangan (nama, tipe, lokasi_id, foto, fasilitas, status) |
| `pricing` | Harga (court_id, day_type, time_type, price_per_hour) |
| `bookings` | Booking (user_id, court_id, date, start_time, end_time, status, total_price) |
| `recurring_bookings` | Booking berulang (booking_id, frequency, day_of_week, until_date) |
| `payments` | Pembayaran (booking_id, amount, method, proof_image, status) |
| `refunds` | Refund (payment_id, amount, status, reason) |
| `points_history` | Log poin (user_id, amount, type, description) |
| `notifications` | Notifikasi (user_id, title, message, type, is_read) |
| `promos` | Promo (code, discount, start_date, end_date, conditions) |
| `reviews` | Testimoni (user_id, court_id, rating, comment) |

---

## 8. Development Phases

### Phase 1 — MVP (4-6 minggu)
- [x] Landing page (semua section)
- [x] Authentication (register, login, Google OAuth)
- [x] Booking system (basic flow tanpa recurring)
- [x] Pembayaran DP (transfer manual + upload bukti)
- [x] Admin dashboard (booking management, konfirmasi pembayaran)
- [x] Bilingual (ID & EN)
- [x] Mobile responsive

### Phase 2 — Enhanced (3-4 minggu)
- [ ] Membership system (tier + poin)
- [ ] Recurring booking
- [ ] Notification system (email + in-app)
- [ ] User dashboard lengkap
- [ ] Kebijakan refund
- [ ] Gallery & testimoni management

### Phase 3 — Advanced (2-3 minggu)
- [ ] Laporan & analytics di admin
- [ ] Promo & event management
- [ ] Penukaran poin (reward store)
- [ ] Referral system
- [ ] SEO optimization
- [ ] Performance tuning

### Phase 4 — Future (opsional)
- [ ] Payment gateway integration (Midtrans/Xendit)
- [ ] WhatsApp notification
- [ ] Mobile app (React Native)
- [ ] Chatbot bantuan
- [ ] Integration dengan Google Calendar

---

## 9. Success Metrics

| Metric | Target |
|--------|--------|
| Booking conversion rate | > 30% dari visitor |
| Member registration rate | > 50% dari yang booking |
| Occupancy rate lapangan | > 70% di prime-time |
| Customer satisfaction | Rating > 4.5/5 |
| Page load time | < 3 detik |
| Bounce rate landing page | < 40% |

---

## 10. Risiko & Mitigasi

| Risiko | Mitigasi |
|--------|----------|
| User malas upload bukti transfer | Reminder otomatis + deadline jelas |
| Double booking | Real-time availability check + locking mechanism |
| Spam/fake booking | Require auth + rate limiting + DP system |
| Admin telat konfirmasi | Notification ke admin + auto-escalation |

---

## 11. Catatan Tambahan

- Website harus bisa diakses 24/7 (high availability)
- Backup database harian
- SSL certificate wajib
- GDPR-friendly (privacy policy, data deletion request)
- Cookie consent banner

---

*Dokumen ini adalah living document dan dapat diupdate sesuai kebutuhan selama development berlangsung.*

**Dibuat:** 28 Mei 2026  
**Versi:** 1.0  
**Author:** Kiro (AI Development Assistant)  
**Client:** JayField Team
