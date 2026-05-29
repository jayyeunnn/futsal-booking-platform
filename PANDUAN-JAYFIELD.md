# Panduan JayField

Selamat datang di **JayField** — website booking lapangan futsal Anda. Dokumen ini berisi penjelasan semua fitur dan cara memakainya.

---

## Daftar Isi

1. [Sekilas tentang JayField](#1-sekilas-tentang-jayfield)
2. [Tiga Tipe Pengguna](#2-tiga-tipe-pengguna)
3. [Akun Awal & Cara Login](#3-akun-awal--cara-login)
4. [Tour Singkat Halaman Publik](#4-tour-singkat-halaman-publik)
5. [Cara Pelanggan Booking Lapangan](#5-cara-pelanggan-booking-lapangan)
6. [Sistem Member: Tier & Poin](#6-sistem-member-tier--poin)
7. [Promo & Reward](#7-promo--reward)
8. [Ajak Teman (Referral)](#8-ajak-teman-referral)
9. [Booking Berulang](#9-booking-berulang)
10. [Pembatalan & Refund](#10-pembatalan--refund)
11. [Notifikasi](#11-notifikasi)
12. [Dashboard Admin (untuk Anda)](#12-dashboard-admin-untuk-anda)
13. [Dashboard Staff](#13-dashboard-staff)
14. [Laporan & Analytics](#14-laporan--analytics)
15. [Pengaturan Website](#15-pengaturan-website)
16. [Bahasa Indonesia & English](#16-bahasa-indonesia--english)
17. [Mode Gelap (Dark Mode)](#17-mode-gelap-dark-mode)
18. [Install Sebagai Aplikasi (PWA)](#18-install-sebagai-aplikasi-pwa)
19. [Notifikasi Push](#19-notifikasi-push)
20. [Pertanyaan yang Sering Ditanya](#20-pertanyaan-yang-sering-ditanya)
21. [Kontak Bantuan](#21-kontak-bantuan)

---

## 1. Sekilas tentang JayField

JayField adalah website tempat pelanggan Anda bisa **memesan lapangan futsal secara online**. Pelanggan tinggal pilih lokasi, lapangan, jadwal, lalu bayar DP via transfer. Anda dan staff mengelola semuanya dari satu dashboard.

**Yang website ini bisa lakukan**:
- Booking lapangan online 24 jam, 7 hari seminggu
- Pembayaran transfer bank / e-wallet
- Sistem member dengan tier (Bronze, Silver, Gold) dan poin
- Promo & event manajemen
- Reward store (tukar poin dengan diskon / sesi gratis / merchandise)
- Booking berulang (recurring) untuk pelanggan rutin
- Ajak teman dapat poin (referral)
- Refund otomatis untuk pembatalan
- Notifikasi email + dalam aplikasi
- Laporan keuangan & operasional
- Bilingual (Indonesia & English)
- Bisa di-install di HP seperti aplikasi (PWA)

**Yang Anda dapat sebagai pemilik**:
- Dashboard admin lengkap untuk lihat & kelola semua aktivitas
- Akses ke semua data pelanggan dan booking
- Kontrol penuh atas harga, lapangan, lokasi, promo
- Laporan keuangan harian/mingguan/bulanan dengan grafik

---

## 2. Tiga Tipe Pengguna

| Tipe | Siapa | Yang Bisa Diakses |
|------|-------|-------------------|
| **Admin** | Pemilik bisnis (Anda) | Semua: lapangan, lokasi, harga, member, promo, laporan, settings, staff |
| **Staff** | Karyawan | Konfirmasi booking & pembayaran, lihat jadwal, lihat refund |
| **Member / Pelanggan** | Pengunjung yang sudah daftar | Booking lapangan, lihat history, klaim reward |

---

## 3. Akun Awal & Cara Login

Saat website pertama kali diserahkan, ada **3 akun siap pakai untuk testing**:

| Tipe | Email | Password |
|------|-------|----------|
| Admin | `admin@jayfield.com` | `admin123` |
| Staff | `staff@jayfield.com` | `staff123` |
| User biasa | `user@example.com` | `user123` |

> **PENTING**: Ganti password ketiga akun ini setelah pertama kali login. Untuk admin asli, ganti emailnya juga ke email Anda.

**Cara login**:
1. Buka website Anda (misal: `https://jayfield.com`)
2. Klik tombol **"Masuk"** di kanan atas
3. Pilih salah satu cara:
   - Email + password
   - Login dengan akun Google
4. Setelah login, Anda otomatis diarahkan ke:
   - Admin & Staff → halaman `/admin`
   - User biasa → halaman `/dashboard`

**Lupa password?** Klik **"Lupa Password?"** di halaman login. Sistem akan kirim link reset ke email.

---

## 4. Tour Singkat Halaman Publik

Halaman ini bisa diakses tanpa login. Cocok untuk pelanggan baru yang sedang browsing.

| Halaman | URL | Isi |
|---------|-----|-----|
| **Beranda** | `/` | Hero, info lapangan, lokasi, harga, gallery, promo, testimoni, FAQ |
| **Lokasi** | `/locations` | Daftar lengkap semua lokasi dengan info detail |
| **Promo** | `/promo` | Daftar promo aktif dengan kode |
| **FAQ** | `/faq` | Pertanyaan umum dikelompokkan per kategori |
| **Kontak** | `/contact` | Info kontak & alamat |

**Fitur tambahan**:
- Smooth scroll: klik link "Lokasi" / "Promo" / "FAQ" di navbar dari halaman beranda → otomatis scroll ke section terkait
- Animasi reveal-on-scroll, count-up statistik, parallax di hero
- Toggle bahasa (ID / EN) di pojok kanan atas
- Toggle tema (terang / gelap / mengikuti sistem)

---

## 5. Cara Pelanggan Booking Lapangan

Alur dari sisi pelanggan:

1. **Klik "Book Sekarang"** di beranda atau navbar
2. **Pilih lokasi** — daftar lokasi dari database, dengan search & filter
3. **Pilih lapangan** — lihat foto, tipe (indoor/outdoor), fasilitas, harga
4. **Pilih jadwal** — kalender + grid jam (warna hijau = tersedia, kuning = pending, merah = sudah dibooking). Klik jam yang berurutan untuk durasi multi-jam
5. **Konfirmasi booking** — review lokasi, lapangan, tanggal, jam
6. **Pilih tipe pembayaran**:
   - **DP 50%** — sisanya bayar di tempat
   - **Bayar Full** — langsung lunas
7. **Pilih metode pembayaran** — Bank Transfer (BCA, BNI, Mandiri, dll) atau E-Wallet (GoPay, OVO, Dana)
8. **Masukkan kode promo** (opsional) — bisa kode promo (`JAYFIELD10`) atau kode reward dari poin (`JF-XXXXXX`)
9. **Klik "Konfirmasi & Bayar"** — booking dibuat dengan status PENDING_PAYMENT
10. **Upload bukti transfer** dalam 1 jam (deadline). Foto bukti bisa di-drag & drop
11. **Tunggu konfirmasi admin** — biasanya < 1 jam
12. **Booking confirmed** — pelanggan dapat email + notifikasi

**Catatan penting**:
- Member Silver otomatis dapat diskon 10%, Gold dapat 20% (langsung apply tanpa kode)
- Promo dan diskon member bisa **stack** (digabung)
- Kalau pelanggan tidak upload bukti dalam 1 jam, booking otomatis di-cancel oleh sistem
- Pelanggan bisa centang **"Booking berulang setiap minggu"** untuk recurring

---

## 6. Sistem Member: Tier & Poin

Setiap orang yang daftar otomatis jadi **member Bronze** (gratis).

### Tier & Cara Naik

| Tier | Syarat | Benefit |
|------|--------|---------|
| **Bronze** | Default saat daftar | Bisa kumpulin poin, akses promo member |
| **Silver** | 15 booking selesai **ATAU** 500 poin | Diskon otomatis 10% di semua booking |
| **Gold** | 30 booking selesai **ATAU** 1500 poin | Diskon otomatis 20%, free extra time 15 menit |

Tier naik **otomatis** setelah booking selesai (sistem cek tiap 30 menit). Member dapat email + notifikasi saat naik tier.

### Cara Dapat Poin

| Aksi | Poin |
|------|------|
| Setiap 1 jam booking selesai | +10 poin |
| Booking di jam 08:00-16:00 (off-peak) | +5 bonus poin |
| Submit review setelah main | +5 poin |
| Teman daftar pakai kode referral kamu & booking pertama | +20 poin |

### Cara Pakai Poin

Pelanggan masuk ke `/dashboard/membership` → tab **"Tukar Poin"** → pilih reward → klaim. Sistem generate kode unik `JF-XXXXXX` yang bisa dipakai saat checkout booking.

---

## 7. Promo & Reward

### Promo (Anda yang buat)

Sebagai admin, Anda bisa buat promo dari `/admin/promos`:
- **Kode promo** (misal `LIBURAN10`)
- **Tipe diskon**: persen (mis. 10%) atau nominal rupiah (mis. Rp 50.000)
- **Periode** mulai & berakhir
- **Batas pemakaian**: total + per user
- **Syarat**: minimum booking, khusus member, tier minimum
- **Maksimal diskon** (untuk persen)

Pelanggan masukkan kode di halaman konfirmasi booking. Sistem cek validasi otomatis.

### Reward Catalog (Tukar Poin)

Default 4 reward:
- Diskon 10% (1x booking) — 100 poin
- Diskon 25% (1x booking) — 200 poin
- Free 1 sesi (1 jam) — 500 poin
- Merchandise JayField — 300 poin

Anda bisa tambah/edit/nonaktifkan reward dari `/admin/rewards`.

---

## 8. Ajak Teman (Referral)

Setiap member dapat **kode referral unik** otomatis (format `JF-XXXXXX`). Mereka share link ke teman:

```
https://jayfield.com/id/register?ref=JF-AB12CD
```

**Alur**:
1. Pelanggan share kode atau link via WhatsApp / Telegram / sosmed
2. Teman daftar pakai kode itu
3. Teman selesaikan booking pertamanya
4. Pelanggan otomatis dapat **+20 poin** + notifikasi

Pelanggan bisa lihat statistik di `/dashboard/referral`: total ajakan, sukses booking, total poin terkumpul.

---

## 9. Booking Berulang

Pelanggan rutin (misal main futsal tiap Sabtu jam 7) bisa centang **"Jadikan booking berulang"** saat checkout.

Sistem otomatis:
- Setiap hari jam 00:01 generate booking baru untuk minggu depan
- Cek konflik (kalau jadwal bentrok, skip)
- Apply tier discount otomatis
- Pelanggan bisa pause / cancel kapan saja dari `/dashboard/recurring`

---

## 10. Pembatalan & Refund

### Kebijakan Refund

| Waktu Pembatalan | Refund |
|------------------|--------|
| H-1 (>24 jam sebelum jadwal) | **100%** dari yang sudah dibayar |
| Hari H tapi >3 jam sebelum jam main | **50%** |
| <3 jam sebelum jam main | **Tidak ada refund** |

Pelanggan klik tombol "Batalkan" di detail booking → modal preview refund + form info rekening (nama bank, nomor, atas nama). Sistem auto-create refund request.

### Sebagai Admin

Anda kelola refund di `/admin/refunds`:
- Lihat list dengan filter status
- Click ke detail → tombol Approve / Reject / Mark Processed
- State machine: REQUESTED → APPROVED → PROCESSED (atau REJECTED)
- Setelah Anda transfer balik, klik "Mark as Processed"
- Pelanggan dapat email & notifikasi setiap perubahan status

---

## 11. Notifikasi

Ada 2 channel:

### Email (otomatis dikirim saat)
- Akun baru dibuat (welcome)
- Booking dibuat (instruksi pembayaran)
- Booking dikonfirmasi
- Booking dibatalkan
- Pengingat H-1 sebelum jadwal main
- Naik tier
- Refund diproses
- Reset password

### Dalam Aplikasi (in-app)
- Bell icon di navbar dashboard dengan badge jumlah belum dibaca
- Notification center di `/dashboard/notifications`
- Filter per kategori: Booking, Pembayaran, Promo, Membership, System
- Mark as read / mark all as read

### Push Notification (Phase 4 — tambahan)
Pelanggan bisa enable di `/dashboard/profile` → toggle "Aktifkan notifikasi browser". Notifikasi muncul di HP/desktop bahkan saat browser ditutup. Membutuhkan setup VAPID keys di server (lihat `PWA.md`).

---

## 12. Dashboard Admin (untuk Anda)

URL: `/admin`. Hanya admin yang bisa akses. Sidebar berisi:

### Beranda Admin (`/admin`)
- **Stats hari ini**: total booking, pendapatan, pending pembayaran, occupancy rate
- **Booking hari ini** (max 6) — quick approve/reject
- **Pending payments** (max 5) — quick view bukti + confirm/reject

### Manajemen Booking (`/admin/bookings`)
- List lengkap dengan filter status (6 status), search, pagination
- Action: confirm, reject (with reason)
- Lihat detail booking + payment history

### Konfirmasi Pembayaran (`/admin/payments`)
- Tab: Pending / Confirmed / Rejected dengan counter
- Bukti transfer ditampilkan langsung (klik untuk full size)
- 1-click approve atau reject (ada form alasan)

### Manajemen Lapangan (`/admin/courts`)
- CRUD lapangan: nama, tipe (indoor/outdoor), foto multiple, fasilitas, harga
- Sub-page foto: drag & drop upload, reorder, delete

### Manajemen Lokasi (`/admin/locations`)
- CRUD lokasi: nama, alamat, kota, jam buka, kontak, koordinat (lat/lng)
- Upload thumbnail
- Smart delete: hard delete kalau tidak ada lapangan, soft cascade kalau ada

### Manajemen Harga (`/admin/pricing`)
- Per lapangan: matrix Weekday/Weekend × Regular/Prime
- Default 4 baris standar untuk lapangan baru
- Edit harga inline dengan formatter rupiah otomatis

### Manajemen Member (`/admin/members`)
- List member dengan stats per tier
- Filter tier, search
- Detail member: info, points history, redemptions
- **Manual point adjustment**: tambah/kurang poin manual + auto-trigger tier upgrade

### Manajemen Promo (`/admin/promos`)
- List dengan stats (active/expired/inactive)
- Form create/edit dengan section: Info, Diskon, Periode, Eligibilitas
- Smart delete: hard delete kalau usage 0, soft delete kalau ada history

### Manajemen Reward (`/admin/rewards`)
- CRUD katalog reward
- Tipe: Discount Percent / Discount Amount / Free Session / Merchandise
- Set poin cost, validity, min tier

### Manajemen Refund (`/admin/refunds`)
- List dengan filter status, search
- Detail full: info user, booking, payment, action panel
- State machine: Approve → Process atau Reject (with reason)

### Manajemen Review (`/admin/reviews`)
- Moderasi review pelanggan
- Toggle visible / hidden
- Filter visibility, search

### Manajemen User & Staff (`/admin/users`)
- Stats per role (Admin / Staff / Customer)
- Create staff baru, edit role, deactivate
- **Last-admin protection**: tidak bisa demote/deactivate admin terakhir
- Self-protection: tidak bisa nonaktifkan diri sendiri

### Laporan (`/admin/reports`)
Lihat section [Laporan & Analytics](#14-laporan--analytics) di bawah.

### Pengaturan (`/admin/settings`)
Lihat section [Pengaturan Website](#15-pengaturan-website) di bawah.

---

## 13. Dashboard Staff

Staff punya akses **terbatas** dibanding admin:
- Bisa lihat & confirm/reject booking
- Bisa lihat & confirm/reject pembayaran
- Bisa lihat refund (tidak bisa approve)
- **Tidak bisa**: kelola lapangan, lokasi, harga, user, settings, lihat laporan keuangan

---

## 14. Laporan & Analytics

URL: `/admin/reports`. Hanya admin & staff.

### Filter Tanggal
- Date picker "dari" + "sampai"
- Preset: 7 hari / 30 hari / 90 hari / 1 tahun
- Default: 30 hari terakhir

### 4 Summary Cards
- **Total Pendapatan** (sum dari payment confirmed)
- **Total Booking** (semua status)
- **Member Baru** (registrasi periode + total kumulatif)
- **Average Occupancy** (booked hours / available hours)

### 5 Chart
1. **Revenue Chart** — line chart per hari/minggu/bulan
2. **Occupancy Chart** — bar chart per court + tabel breakdown per court
3. **Member Growth** — area chart dengan tier distribution
4. **Top Courts** — horizontal bar chart top 10 lapangan terlaris
5. **Cancellation Rate** — line chart % cancellation per periode

### Export CSV
Setiap chart punya tombol "Export CSV" — download data mentahnya untuk analisis di Excel.

---

## 15. Pengaturan Website

URL: `/admin/settings`. Hanya admin.

### App Settings (3 section, 9 nilai)

**Pembayaran**
- DP percentage (default 50%)
- Payment deadline minutes (default 60)

**Refund Policy**
- H-1 refund % (default 100)
- Same-day >3jam refund % (default 50)
- Less than 3 jam refund % (default 0)

**Sistem Poin**
- Points per hour (default 10)
- Points per review (default 5)
- Points per referral (default 20)
- Off-peak bonus (default 5)

### Payment Methods Manager
- CRUD bank account & e-wallet
- Toggle aktif/nonaktif
- Sort order
- Tipe: Bank Transfer atau E-Wallet

---

## 16. Bahasa Indonesia & English

Toggle ID / EN di navbar (icon globe). Semua text otomatis terjemahan, termasuk:
- UI components
- Email templates
- Notifications
- Error messages
- SEO meta tags

URL otomatis pakai prefix locale: `/id/...` atau `/en/...`. Default: ID.

---

## 17. Mode Gelap (Dark Mode)

Toggle di navbar (icon matahari/bulan/monitor). 3 pilihan:
- **Terang** (light)
- **Gelap** (dark)
- **Sistem** (ikut OS user)

Pilihan disimpan di browser, jadi sticky antar kunjungan. Tidak ada flash putih saat pertama load.

---

## 18. Install Sebagai Aplikasi (PWA)

Website ini Progressive Web App — bisa di-install di HP atau desktop seperti aplikasi native.

### Cara Install (HP)
1. Buka website di Chrome / Safari
2. Tap menu browser → **"Add to Home Screen"** / **"Install App"**
3. Icon JayField muncul di home screen
4. Klik icon → buka full-screen tanpa address bar (kayak app)

### Mode Offline
- Jika koneksi internet putus, halaman terakhir yang diakses tetap bisa dibuka
- Booking history user tersimpan di cache HP — bisa dilihat offline
- Banner "Mode Offline" muncul di atas saat tidak terkoneksi

---

## 19. Notifikasi Push

Pelanggan bisa enable di `/dashboard/profile` → toggle "Aktifkan notifikasi browser".

**Apa yang bisa dikirim**:
- Booking confirmed
- Pengingat H-1
- Promo baru (jika di-broadcast admin)
- Naik tier

**Catatan untuk Anda (admin)**: Push notification butuh setup VAPID keys di environment variable. Lihat file `PWA.md` untuk panduan setup.

---

## 20. Pertanyaan yang Sering Ditanya

### Bagaimana cara ganti password admin default?
Login pakai `admin@jayfield.com` / `admin123` → klik avatar di kanan atas → Profile → Ubah Password.

### Bisa ganti email admin?
Belum ada UI khusus untuk ganti email. Bisa lewat database langsung atau bikin admin baru lalu hapus yang lama. Hubungi developer.

### Bagaimana kalau bukti transfer pelanggan tidak jelas?
Klik "Reject" dengan alasan. Pelanggan dapat notifikasi + kesempatan upload ulang (selama belum expired).

### Apakah email otomatis terkirim?
Ya, kalau Anda set `RESEND_API_KEY` di environment variable. Kalau belum di-set, email jadi no-op (tidak kirim, tapi sistem tetap jalan).

### Bagaimana cara backup data?
Database di Supabase auto-backup harian. Anda bisa juga export manual via Supabase dashboard.

### Berapa kapasitas hosting yang dipakai?
- Vercel free tier: 100 GB bandwidth/bulan, cocok untuk traffic awal
- Supabase free tier: 500 MB database, 1 GB file storage
- UploadThing free tier: 2 GB storage

### Bisa nambah lokasi baru?
Bisa, dari `/admin/locations` → New. Atau dari Supabase langsung.

### Bisa custom domain?
Bisa. Beli domain (di mana saja), arahkan DNS ke Vercel, set di Vercel project. Detail: hubungi developer.

### Apakah aman untuk data pelanggan?
- Password di-hash bcrypt
- HTTPS otomatis (Vercel)
- Rate limiting di endpoint sensitive (login, register, booking)
- CSRF protection via NextAuth
- Input validation di semua form

### Apa beda Phase 1, 2, 3?
- **Phase 1 (MVP)**: booking dasar, login, payment manual, admin dashboard dasar
- **Phase 2 (Enhanced)**: membership, recurring, notifikasi, refund, gallery, review
- **Phase 3 (Advanced)**: laporan, promo, reward, referral, SEO, performance
- **Phase 4 (Future, opsional)**: payment gateway otomatis (Midtrans), WhatsApp notif, dll

### Apakah Phase 4 sudah include?
Sebagian: Dark mode + PWA + Push notification sudah ready. Sisanya (Midtrans, WhatsApp, mobile app native) butuh akun eksternal & developer follow-up.

---

## 21. Kontak Bantuan

Untuk hal teknis (deploy, setup, bug, custom feature):
**Hubungi developer** yang membuat website ini.

Untuk pertanyaan bisnis (cara pakai dashboard):
**Baca dokumen ini lagi**, atau tanya developer untuk training tatap muka.

---

## Lampiran: Daftar Lengkap Halaman

### Publik (tanpa login)
- `/` — Beranda
- `/locations` — Daftar lokasi
- `/promo` — Daftar promo
- `/faq` — FAQ
- `/contact` — Kontak
- `/login` — Login
- `/register` — Daftar akun
- `/forgot-password` — Lupa password
- `/booking` — Mulai booking (akan minta login saat checkout)

### Member (perlu login user)
- `/dashboard` — Beranda dashboard
- `/dashboard/bookings` — History booking
- `/dashboard/bookings/[id]` — Detail booking + upload bukti
- `/dashboard/recurring` — Booking berulang
- `/dashboard/membership` — Tier & reward store
- `/dashboard/points` — Points history
- `/dashboard/favorites` — Lapangan favorit
- `/dashboard/referral` — Ajak teman
- `/dashboard/notifications` — Notifikasi
- `/dashboard/profile` — Edit profil + ganti password + push notif

### Admin / Staff (perlu login admin)
- `/admin` — Overview
- `/admin/bookings` — Kelola booking
- `/admin/payments` — Konfirmasi pembayaran
- `/admin/courts` — Kelola lapangan
- `/admin/locations` — Kelola lokasi
- `/admin/pricing` — Kelola harga
- `/admin/members` — Kelola member
- `/admin/promos` — Kelola promo
- `/admin/rewards` — Kelola reward catalog
- `/admin/refunds` — Kelola refund
- `/admin/reviews` — Moderasi review
- `/admin/users` — Kelola user/staff (admin only)
- `/admin/reports` — Laporan & analytics
- `/admin/settings` — Pengaturan website (admin only)

---

*Dokumen ini akan diupdate seiring penambahan fitur. Versi terakhir: 29 Mei 2026.*
