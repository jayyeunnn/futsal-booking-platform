# 🏟️ JayField — Ringkasan Project

---

## Apa itu JayField?

**JayField** adalah website untuk booking (pesan) lapangan futsal secara online. Jadi pelanggan tidak perlu datang atau telepon untuk cek jadwal — cukup buka website, pilih lapangan, pilih jam, bayar, selesai.

---

## Fitur Utama (Apa yang bisa dilakukan di website ini?)

### 🏠 Untuk Pelanggan:

| Fitur | Penjelasan Singkat |
|-------|-------------------|
| **Booking Online** | Pilih lokasi → pilih lapangan (indoor/outdoor) → pilih tanggal & jam → bayar |
| **Pilih Bayar DP atau Full** | Bisa bayar separuh dulu (DP 50%) atau langsung bayar penuh |
| **Transfer Manual** | Bayar via BCA, BNI, Mandiri, BRI, Dana, OVO, atau GoPay — lalu upload bukti |
| **Lihat Ketersediaan** | Kalender visual — warna hijau berarti kosong, merah berarti sudah dipesan |
| **Booking Berulang** | Kalau rutin main tiap minggu, bisa auto-booking otomatis |
| **Membership (Gratis)** | Daftar = langsung jadi member. Sering booking = naik level = dapat diskon lebih |
| **Sistem Poin** | Setiap booking dapat poin. Poin bisa ditukar diskon atau gratis 1 sesi |
| **Notifikasi** | Dapat email pengingat H-1, konfirmasi booking, info promo |
| **Batal & Refund** | Bisa batalkan booking. Refund tergantung waktu pembatalan (100%, 50%, atau 0%) |
| **2 Bahasa** | Website bisa dipakai dalam Bahasa Indonesia atau English |
| **Mobile Friendly** | Bisa diakses dengan nyaman di HP, tablet, atau laptop |

### 👨‍💼 Untuk Admin/Pemilik:

| Fitur | Penjelasan Singkat |
|-------|-------------------|
| **Dashboard** | Lihat total booking hari ini, pendapatan, lapangan mana yang paling laris |
| **Konfirmasi Pembayaran** | Lihat bukti transfer dari pelanggan, klik setuju/tolak |
| **Kelola Booking** | Lihat semua booking, filter, approve, reject |
| **Kelola Lapangan** | Tambah/edit/hapus lapangan, set harga, upload foto |
| **Kelola Promo** | Buat kode promo, tentukan diskon, set periode berlaku |
| **Kelola Member** | Lihat data member, adjust poin |
| **Laporan** | Grafik pendapatan, occupancy rate, pertumbuhan member |
| **Multi-lokasi** | Bisa kelola banyak lokasi dari 1 dashboard |

---

## Sistem Membership (Level & Poin)

| Level | Cara Naik | Keuntungan |
|-------|-----------|------------|
| 🥉 **Bronze** | Daftar akun (gratis) | Kumpulkan poin, akses promo member |
| 🥈 **Silver** | 15x booking ATAU 500 poin | Diskon 10%, booking duluan di jam ramai |
| 🥇 **Gold** | 30x booking ATAU 1500 poin | Diskon 20%, extra time gratis 15 menit, undangan event VIP |

**Cara dapat poin:** Booking (+10/jam), kasih review (+5), ajak teman (+20), main di jam sepi (+5 bonus)

**Tukar poin:** Diskon 10% (100 poin), Diskon 25% (200 poin), Gratis 1 jam (500 poin)

---

## Alur Booking (Step by Step)

```
1. Buka website
2. Klik "Book Sekarang"
3. Login / Daftar (bisa pakai Google)
4. Pilih lokasi mana
5. Pilih lapangan (indoor/outdoor)
6. Pilih tanggal dan jam yang kosong
7. Pilih bayar DP (50%) atau Full (100%)
8. Pilih metode (BCA/Dana/dll)
9. Transfer uang → upload bukti
10. Tunggu admin konfirmasi (biasanya <1 jam)
11. Booking terkonfirmasi! ✅
12. Datang dan main futsal 🎉
```

---

## Teknologi yang Digunakan (dan Fungsinya)

| Teknologi | Untuk Apa? (Bahasa Awam) |
|-----------|--------------------------|
| **Next.js 14** | "Mesin" utama website — membuat halaman cepat, bisa dilihat di Google (SEO), dan aman |
| **TypeScript** | Bahasa pemrograman yang digunakan — mengurangi bug/error saat development |
| **Tailwind CSS** | Mengatur tampilan website (warna, ukuran, posisi) agar terlihat rapi dan modern |
| **shadcn/ui** | Koleksi komponen siap pakai (tombol, form, card) — mempercepat pembuatan UI |
| **PostgreSQL** | Database — tempat menyimpan semua data (user, booking, pembayaran, dll) |
| **Prisma** | "Penerjemah" antara website dan database — memudahkan baca/tulis data |
| **NextAuth.js** | Sistem login — mengatur registrasi, login, dan keamanan akun |
| **Google OAuth** | Memungkinkan login langsung dengan akun Google (tanpa perlu buat password) |
| **next-intl** | Mengatur 2 bahasa (Indonesia & English) di seluruh website |
| **Resend** | Mengirim email otomatis (konfirmasi booking, reminder, reset password) |
| **Vercel** | Tempat hosting website — bisa diakses 24/7 dari mana saja |
| **Supabase/Railway** | Tempat hosting database online |
| **Zod** | Validasi data — memastikan input dari user benar sebelum diproses |
| **bcrypt** | Mengenkripsi password — agar aman dan tidak bisa dibaca orang lain |

---

## API yang Digunakan (Komunikasi antara Website dan Server)

API adalah "jembatan" yang menghubungkan tampilan website dengan data di server. Berikut semua API yang ada:

### 🔐 Authentication (Login & Registrasi)

| API | Fungsi |
|-----|--------|
| `POST /api/auth/register` | Mendaftarkan akun baru (nama, email, password) |
| `POST /api/auth/login` | Masuk ke akun yang sudah terdaftar |
| `POST /api/auth/forgot-password` | Minta link reset password via email |
| `POST /api/auth/reset-password` | Ganti password dengan link yang dikirim ke email |
| `GET /api/auth/session` | Cek siapa yang sedang login |

### 📍 Lokasi & Lapangan

| API | Fungsi |
|-----|--------|
| `GET /api/locations` | Ambil daftar semua lokasi JayField |
| `GET /api/courts?locationId=xxx` | Ambil daftar lapangan di lokasi tertentu |
| `GET /api/courts/[id]/availability?date=xxx` | Cek jadwal kosong/terisi untuk tanggal tertentu |

### 📅 Booking

| API | Fungsi |
|-----|--------|
| `POST /api/bookings` | Buat booking baru (pilih lapangan, jam, tipe bayar) |
| `GET /api/bookings` | Lihat daftar booking milik user yang login |

### 💳 Pembayaran

| API | Fungsi |
|-----|--------|
| `GET /api/payments` | Ambil daftar metode pembayaran yang tersedia (BCA, Dana, dll) |
| `GET /api/payments/[bookingId]` | Lihat detail pembayaran untuk booking tertentu |
| `POST /api/payments/upload-proof` | Upload bukti transfer setelah bayar |

### 🎫 Promo

| API | Fungsi |
|-----|--------|
| `POST /api/promos/validate` | Cek apakah kode promo valid dan berapa diskonnya |

### 👨‍💼 Admin — Booking & Pembayaran

| API | Fungsi |
|-----|--------|
| `GET /api/admin/bookings` | Admin lihat semua booking dari semua user |
| `PUT /api/admin/payments/[id]/confirm` | Admin konfirmasi pembayaran (bukti transfer valid) |
| `PUT /api/admin/payments/[id]/reject` | Admin tolak pembayaran (bukti tidak valid) |

---

## Tahapan Development

| Phase | Isi | Status |
|-------|-----|--------|
| **Phase 1 (MVP)** | Landing page, booking, pembayaran, admin, login, 2 bahasa, mobile | ✅ Selesai |
| **Phase 2** | Membership & poin, booking berulang, notifikasi email, refund | 🔜 Berikutnya |
| **Phase 3** | Laporan grafik, promo, reward store, referral, SEO | Nanti |
| **Phase 4** | Payment gateway otomatis, WhatsApp notif, mobile app | Masa depan |

---

## Kebijakan Pembatalan & Refund

| Waktu Pembatalan | Uang Kembali |
|------------------|--------------|
| Batal **H-1** (lebih dari 24 jam sebelum main) | 100% DP dikembalikan |
| Batal **di hari H** (lebih dari 3 jam sebelum) | 50% DP dikembalikan |
| Batal **kurang dari 3 jam** sebelum jadwal | Tidak ada pengembalian |

---

## Jam Operasional

Semua lokasi JayField buka **setiap hari** dari **08:00 pagi** sampai **00:00 (tengah malam)**.

---

## Desain Website

- **Warna:** Hijau tua (sporty) + Orange (tombol utama)
- **Gaya:** Modern, minimalis, sporty
- **Font:** Montserrat (judul), Inter (isi)
- **Responsif:** Otomatis menyesuaikan layar HP, tablet, dan desktop

---

*Dokumen ini dibuat agar siapa saja bisa memahami apa itu JayField tanpa perlu latar belakang teknis.*
