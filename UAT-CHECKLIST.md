# Panduan UAT — User Acceptance Testing JayField

> **Halo Bapak/Ibu, ini adalah panduan untuk uji coba terakhir website JayField sebelum dipakai sungguhan.**
>
> Tugas Anda: jalankan checklist di bawah, centang yang sudah dicoba, beri tanda silang kalau ada yang tidak sesuai harapan. Anda tidak perlu tahu hal teknis — cukup pakai websitenya seperti pelanggan biasa.

**Estimasi waktu**: 2-3 jam (bisa dicicil)
**Yang dibutuhkan**: laptop/komputer + HP, akun test (sudah disediakan)

---

## Daftar Isi

1. [Akun Test untuk UAT](#1-akun-test-untuk-uat)
2. [Cara Pakai Checklist Ini](#2-cara-pakai-checklist-ini)
3. [Test Pelanggan Biasa](#3-test-pelanggan-biasa)
4. [Test Member](#4-test-member)
5. [Test Pembatalan & Refund](#5-test-pembatalan--refund)
6. [Test Admin](#6-test-admin)
7. [Test Staff](#7-test-staff)
8. [Test Tampilan & UX](#8-test-tampilan--ux)
9. [Test di HP](#9-test-di-hp)
10. [Test PWA (Install di HP)](#10-test-pwa-install-di-hp)
11. [Test Bahasa & Tema](#11-test-bahasa--tema)
12. [Catatan Bug atau Saran](#12-catatan-bug-atau-saran)
13. [Sign-Off Klien](#13-sign-off-klien)


---

## 1. Akun Test untuk UAT

| Tipe | Email | Password | Untuk apa |
|------|-------|----------|-----------|
| **Admin** | admin@jayfield.com | admin123 | Anda sebagai pemilik bisnis |
| **Staff** | staff@jayfield.com | staff123 | Karyawan yang konfirmasi pembayaran |
| **User** | user@example.com | user123 | Pelanggan biasa |

**Cara login**:
1. Buka website (URL akan dikasih developer)
2. Klik tombol **"Masuk"** di pojok kanan atas
3. Masukkan email + password
4. Selesai

> 💡 **Tips**: Buka 2 browser berbeda (misal Chrome + Firefox) supaya bisa login sebagai 2 orang sekaligus — admin di satu browser, user di browser lain. Gampang untuk test.

---

## 2. Cara Pakai Checklist Ini

- ☐ = belum dicoba
- ✅ = sudah dicoba dan **berhasil**
- ❌ = sudah dicoba tapi **gagal** (catat di Section 12)
- ⚠️ = sudah dicoba tapi ada **catatan kecil** (catat di Section 12)

**Aturan penting**:
1. Jangan lewat langkahnya — semua checklist berurutan ada alasannya
2. Kalau ada yang gagal, **screenshot** dan kasih tahu developer
3. Kalau ragu apakah hasilnya benar atau salah, **tanya sebelum lanjut**
4. Tidak perlu test semua dalam 1 hari — bisa dicicil


---

## 3. Test Pelanggan Biasa

### 3.1 Daftar Akun Baru

Login pakai akun pelanggan, atau **buat akun baru** untuk pengalaman fresh.

- ☐ Buka halaman utama website, klik tombol **"Daftar"**
- ☐ Isi form dengan email baru (misal: `test@gmail.com`), nama, password
- ☐ Centang persetujuan terms & conditions
- ☐ Klik **"Daftar Sekarang"**
- ☐ ✨ Confetti muncul (animasi semburan warna) — celebrasi akun terbuat
- ☐ Otomatis ter-login dan diarahkan ke dashboard pelanggan

### 3.2 Booking Lapangan Pertama

- ☐ Dari dashboard, klik **"Booking Baru"** (atau buka `/booking`)
- ☐ Lihat **stepper di atas**: ada 4 langkah — Lokasi, Lapangan, Jadwal, Bayar
- ☐ Pilih salah satu lokasi (misal: JayField Sudirman)
- ☐ Pilih salah satu lapangan (misal: Lapangan 1)
- ☐ Lihat **kalender** — tanggal hari Sabtu/Minggu warnanya berbeda (oranye)
- ☐ Pilih tanggal besok atau lusa
- ☐ Lihat **daftar jam** muncul dengan harga per jam
- ☐ Klik 1 jam (misal jam 19:00) → terpilih dengan tanda centang
- ☐ Klik 1 jam lagi yang **berurutan** (jam 20:00) → ikut terpilih
- ☐ Lihat ringkasan di sebelah kanan: total harga, durasi 2 jam
- ☐ Klik tombol **"Lanjut ke Pembayaran"**
- ☐ Lihat halaman konfirmasi: detail booking + pilih DP/Full + pilih bank
- ☐ Pilih **DP 50%**
- ☐ Pilih bank **BCA**
- ☐ (Opsional) Coba isi kode promo: `JAYFIELD10` → diskon 10% muncul
- ☐ Klik **"Konfirmasi & Bayar"**
- ☐ Otomatis ke halaman detail booking
- ☐ Lihat **timer countdown** "Sisa waktu pembayaran" — berhitung mundur

### 3.3 Upload Bukti Transfer

- ☐ Di halaman booking detail, scroll ke bawah cari section **"Upload Bukti Transfer"**
- ☐ Drag & drop foto apa saja (atau klik untuk pilih file)
- ☐ Tunggu upload selesai
- ☐ Toast muncul "Bukti pembayaran terkirim"
- ☐ Status booking berubah jadi "Menunggu Konfirmasi"

### 3.4 Tunggu Admin Konfirmasi

> Sekarang pindah ke browser lain, login sebagai admin, lalu approve pembayaran.

- ☐ Login sebagai admin di browser kedua
- ☐ Buka `/admin/payments`
- ☐ Cari booking yang baru saja dibuat
- ☐ Klik foto bukti transfer → muncul lightbox full screen
- ☐ Klik **"Konfirmasi"**
- ☐ Toast muncul "Pembayaran dikonfirmasi"

### 3.5 Lihat Booking Confirmed

> Kembali ke browser pertama (sebagai pelanggan).

- ☐ Refresh halaman booking detail
- ☐ Status berubah jadi "Dikonfirmasi"
- ☐ Muncul **kartu hijau "Booking siap!"** dengan tombol-tombol:
  - ☐ Klik **"Tampilkan QR Code"** → QR muncul (bisa di-scan admin saat datang)
  - ☐ Klik **"Add to Calendar"** → file `.ics` ter-download
  - ☐ Klik **"Google Cal"** → halaman Google Calendar terbuka dengan event sudah ke-isi
  - ☐ Klik **"WhatsApp"** → halaman WA dengan template message muncul
  - ☐ Klik **"Bagikan"** → menu share OS muncul (atau salin link)


---

## 4. Test Member

### 4.1 Lihat Tier & Poin

- ☐ Login sebagai user
- ☐ Buka `/dashboard/membership`
- ☐ Lihat tier saat ini (default Bronze)
- ☐ Lihat progress bar ke tier berikutnya
- ☐ Lihat benefit per tier
- ☐ Lihat tier comparison table

### 4.2 Lihat History Poin

- ☐ Buka `/dashboard/points`
- ☐ Tab "Semua" tampilkan semua transaksi poin
- ☐ Tab "Diterima" filter cuma yang positif
- ☐ Tab "Ditukar" filter cuma redemption

### 4.3 Tukar Poin (Redeem Reward)

> Untuk test ini, perlu admin tambahkan poin manual dulu.

- ☐ Login admin → `/admin/members`
- ☐ Cari user → klik detail → tambah 500 poin manual
- ☐ Login user → `/dashboard/membership` tab Tukar Poin
- ☐ Pilih reward "Diskon 10%" (100 poin)
- ☐ Klik tukar → confirmation dialog muncul
- ☐ Klik confirm → ✨ confetti, kode `JF-XXXXXX` muncul
- ☐ Poin user berkurang 100

### 4.4 Pakai Kode Reward di Booking

- ☐ Mulai booking baru
- ☐ Di halaman konfirmasi, masukkan kode reward `JF-XXXXXX`
- ☐ Diskon 10% ter-apply (sama dengan promo)
- ☐ Submit booking → kode mark as used (tidak bisa dipakai lagi)

### 4.5 Submit Review

> Hanya bisa untuk booking yang sudah COMPLETED.

- ☐ (Untuk test, admin manual update status booking ke COMPLETED via DB)
- ☐ User buka detail booking COMPLETED
- ☐ Form review muncul (rating 1-5 + comment)
- ☐ Submit → ✨ confetti, +5 poin, review tersimpan

### 4.6 Favoritkan Lapangan

- ☐ Buka detail booking → klik tombol **❤ Favorit** di court
- ☐ Buka `/dashboard/favorites` → court tampil di list
- ☐ Klik ❤ lagi untuk un-favorite

### 4.7 Lihat Notifikasi

- ☐ Klik **bell icon** di pojok kanan atas dashboard
- ☐ Notification center terbuka, tampil daftar notif
- ☐ Klik 1 notif → mark as read, badge berkurang
- ☐ Klik **"Mark all as read"** → semua jadi terbaca

### 4.8 Ajak Teman (Referral)

- ☐ Buka `/dashboard/referral`
- ☐ Lihat **kode referral kamu** (format `JF-XXXXXX`)
- ☐ Klik **Copy** kode → tersalin
- ☐ Klik tombol **WhatsApp / Telegram** → window share terbuka
- ☐ Logout, register akun baru pakai kode tadi
- ☐ Login admin → cek di /admin/members → user baru terdaftar dengan referredBy


---

## 5. Test Pembatalan & Refund

### 5.1 Cancel Booking H-1 (Refund 100%)

- ☐ Login user → buat booking untuk **lebih dari 24 jam ke depan**
- ☐ Bayar DP, admin approve
- ☐ Setelah CONFIRMED, klik tombol **"Batalkan"** di booking detail
- ☐ Modal muncul: preview refund **100%**
- ☐ Isi form: nama bank, nomor rekening, atas nama
- ☐ Submit → booking → CANCELLED, refund REQUESTED

### 5.2 Admin Process Refund

- ☐ Login admin → `/admin/refunds`
- ☐ Cari refund yang baru dibuat (status REQUESTED)
- ☐ Klik detail → semua info user, booking, payment tampil
- ☐ Klik **Approve** → status → APPROVED, user dapat email + notif
- ☐ (Lakukan transfer balik ke pelanggan secara manual di bank Anda)
- ☐ Kembali ke admin, klik **"Mark as Processed"**
- ☐ Status → PROCESSED, user dapat email "Refund diproses"

### 5.3 Cancel Booking <3 Jam Sebelum (Tidak Refund)

- ☐ Buat booking untuk **kurang dari 3 jam dari sekarang** (admin manual ubah waktu di DB jika perlu)
- ☐ Klik Batalkan → modal muncul, info "Tidak ada refund"
- ☐ Submit → booking → CANCELLED, tidak ada refund record


---

## 6. Test Admin

> Login sebagai `admin@jayfield.com` / `admin123`.

### 6.1 Beranda Admin

- ☐ Buka `/admin`
- ☐ Lihat 4 stats card: total booking, revenue, pending payments, occupancy rate
- ☐ Lihat daftar booking hari ini (max 6)
- ☐ Lihat daftar pending payments (max 5)

### 6.2 Manajemen Lapangan

- ☐ Buka `/admin/courts`
- ☐ Klik **"Tambah Lapangan"** → buat lapangan baru
- ☐ Isi nama, tipe, fasilitas, harga
- ☐ Upload foto via UploadThing
- ☐ Save → lapangan baru muncul di list
- ☐ Klik edit → ubah nama → save
- ☐ Klik delete → modal konfirmasi → hapus (kalau no booking)

### 6.3 Manajemen Lokasi

- ☐ Buka `/admin/locations`
- ☐ Lihat grid card lokasi
- ☐ Buat lokasi baru lengkap dengan thumbnail
- ☐ Edit lokasi → ubah jam buka → save

### 6.4 Manajemen Harga

- ☐ Buka `/admin/pricing`
- ☐ Pilih 1 lapangan → buka editor matrix
- ☐ Lihat 4 baris: Weekday Regular, Weekday Prime, Weekend Regular, Weekend Prime
- ☐ Edit harga 1 baris (misal jadi 200rb)
- ☐ Save → coba booking lapangan itu, harga sudah berubah

### 6.5 Manajemen Member

- ☐ Buka `/admin/members`
- ☐ Lihat stats per tier (Bronze/Silver/Gold)
- ☐ Filter tier Silver → list cuma Silver
- ☐ Search nama → list ter-filter
- ☐ Klik 1 member → detail terbuka
- ☐ Klik **"Adjust Poin"** → tambah/kurang poin
- ☐ Submit → poin terupdate, history tercatat
- ☐ Cek di akun member tersebut → poin sudah berubah

### 6.6 Manajemen Promo

- ☐ Buka `/admin/promos`
- ☐ Buat promo baru: kode `TESTUAT`, diskon 15%, periode 7 hari
- ☐ Save → promo aktif
- ☐ Login user → coba pakai kode `TESTUAT` saat booking → diskon 15% ter-apply
- ☐ Kembali ke admin → toggle promo jadi non-aktif → user coba pakai → error
- ☐ Hapus promo

### 6.7 Manajemen Reward

- ☐ Buka `/admin/rewards`
- ☐ Lihat 4 reward default
- ☐ Buat reward baru: "Diskon 50%" tipe DISCOUNT_PERCENT, value 50, cost 1000 poin
- ☐ Save → reward muncul
- ☐ Edit → ubah cost jadi 800 → save

### 6.8 Manajemen Refund

- ☐ Buka `/admin/refunds`
- ☐ Lihat list refund dengan filter status
- ☐ (Lihat Section 5.2 untuk flow lengkap)

### 6.9 Moderasi Review

- ☐ Buka `/admin/reviews`
- ☐ Lihat list review pelanggan
- ☐ Toggle visibility 1 review → user umum tidak lihat lagi di public
- ☐ Toggle balik → muncul lagi

### 6.10 Manajemen User & Staff

- ☐ Buka `/admin/users`
- ☐ Lihat stats per role (Admin/Staff/Customer)
- ☐ Filter role Staff
- ☐ Klik **"Tambah Staff"** → buat akun staff baru
- ☐ Login dengan akun staff → cek akses terbatas (Section 7)
- ☐ Kembali ke admin → deactivate staff itu
- ☐ Coba login staff yang dideactivate → error "Akun dinonaktifkan"

### 6.11 Laporan & Analytics

- ☐ Buka `/admin/reports`
- ☐ Lihat 4 summary card
- ☐ Lihat 5 chart (Revenue, Occupancy, Member Growth, Top Courts, Cancellation)
- ☐ Ubah date range → angka berubah
- ☐ Klik preset "7 Hari" / "90 Hari" → date filter berubah
- ☐ Klik **"Export CSV"** di salah satu chart → file CSV terdownload, bisa dibuka di Excel

### 6.12 Pengaturan

- ☐ Buka `/admin/settings`
- ☐ Lihat 9 pengaturan default
- ☐ Ubah DP percentage dari 50 jadi 30
- ☐ Save
- ☐ Login user → coba booking → DP otomatis 30%
- ☐ Kembali ke admin → balikin ke 50


---

## 7. Test Staff

> Login sebagai `staff@jayfield.com` / `staff123`.

- ☐ Setelah login, otomatis di `/admin`
- ☐ Lihat sidebar — beberapa menu **TIDAK MUNCUL**:
  - ☐ ❌ "Manajemen User" tidak ada
  - ☐ ❌ "Pengaturan" tidak ada
  - ☐ ❌ "Laporan" tidak ada (atau muncul tapi limited)
- ☐ Coba akses `/admin/users` langsung → redirect / error 403
- ☐ Coba akses `/admin/settings` langsung → redirect / error 403
- ☐ Coba `/admin/payments` → bisa, lihat list
- ☐ Approve 1 payment → berhasil
- ☐ `/admin/bookings` → bisa, approve/reject berjalan
- ☐ `/admin/refunds` → bisa lihat, **tidak bisa** approve (admin only)


---

## 8. Test Tampilan & UX

### 8.1 Animasi & Transisi

- ☐ Buka homepage → scroll ke bawah → section animasi muncul satu per satu
- ☐ Scroll ke section "Stats" → angka counting up dari 0 ke target
- ☐ Hover court card di landing → angkat sedikit ke atas
- ☐ Klik gallery image → lightbox fullscreen terbuka
- ☐ Tekan ← → di keyboard → next/prev image
- ☐ Tekan ESC → lightbox tertutup
- ☐ Loading skeleton muncul saat pindah halaman

### 8.2 Toast & Confirmation

- ☐ Submit form sukses → toast hijau muncul di pojok
- ☐ Submit form error → toast merah muncul
- ☐ Klik tombol delete → modal konfirmasi muncul
- ☐ Tekan ESC → modal tertutup
- ☐ Confetti muncul saat: register sukses, redeem reward, submit review

### 8.3 Empty States

- ☐ Buka `/dashboard/bookings` (akun baru) → empty state friendly
- ☐ Buka `/dashboard/favorites` → empty state heart icon
- ☐ Buka `/dashboard/notifications` → empty state bell icon
- ☐ Tombol CTA di empty state berfungsi (mis. "Mulai Booking" → ke /booking)


---

## 9. Test di HP

> Buka website di HP (Chrome Android atau Safari iOS).

### 9.1 Layout Mobile

- ☐ Tidak ada horizontal scroll (geser kanan-kiri)
- ☐ Semua tombol besar dan mudah ditekan dengan jempol
- ☐ Hamburger menu (3 garis) di pojok kiri atas
- ☐ Tap hamburger → drawer menu muncul dari kiri
- ☐ Tap di luar drawer → tertutup

### 9.2 Booking di HP

- ☐ Lakukan flow booking lengkap di HP
- ☐ Calendar di mobile masih usable
- ☐ Slot picker scroll vertical, tap mudah
- ☐ Halaman konfirmasi: tombol bayar **stick di bottom screen** (sticky CTA)
- ☐ Total bayar selalu kelihatan di bottom

### 9.3 Upload Foto Bukti dari HP

- ☐ Di booking detail, tap area upload
- ☐ Pilih: ambil foto dari kamera HP, atau pilih dari galeri
- ☐ Upload selesai, foto tampil


---

## 10. Test PWA (Install di HP)

### 10.1 Install ke Home Screen

**Android (Chrome)**:
- ☐ Buka website di Chrome HP
- ☐ Tap menu 3 titik di pojok kanan atas
- ☐ Pilih **"Add to Home screen"** atau **"Install app"**
- ☐ Konfirmasi → icon JayField muncul di home screen
- ☐ Tap icon → website terbuka tanpa address bar (standalone mode)

**iPhone (Safari)**:
- ☐ Buka website di Safari iOS
- ☐ Tap tombol Share (kotak dengan panah ke atas)
- ☐ Scroll bawah → pilih **"Add to Home Screen"**
- ☐ Konfirmasi → icon muncul di home screen

### 10.2 Mode Offline

- ☐ Buka aplikasi yang sudah di-install
- ☐ Aktifkan **Airplane Mode** di HP
- ☐ Coba buka aplikasi → halaman terakhir yang dilihat masih bisa dibuka
- ☐ Banner kuning "Mode Offline" muncul di atas
- ☐ Coba buka halaman baru → halaman offline muncul

### 10.3 Push Notification

> Hanya jalan kalau VAPID keys sudah di-set di env. Skip kalau belum.

- ☐ Login user → buka `/dashboard/profile`
- ☐ Toggle "Aktifkan notifikasi browser" → ON
- ☐ Browser meminta permission → izinkan
- ☐ Toast "Push diaktifkan" muncul


---

## 11. Test Bahasa & Tema

### 11.1 Switch Bahasa

- ☐ Klik **Globe icon** di navbar → toggle ID ↔ EN
- ☐ URL berubah: `/id/...` → `/en/...`
- ☐ Semua text berubah jadi English
- ☐ Refresh halaman → tetap di bahasa yang dipilih

### 11.2 Switch Tema (Dark Mode)

- ☐ Klik **Sun/Moon icon** di navbar
- ☐ Pilih "Gelap" → background berubah hitam
- ☐ Pilih "Terang" → kembali putih
- ☐ Pilih "Sistem" → ikut OS setting
- ☐ Refresh halaman → tema terakhir tersimpan
- ☐ Tidak ada flash putih saat awal load di mode gelap


---

## 12. Catatan Bug atau Saran

> Tulis di sini kalau ada yang **gagal** atau **ada saran perbaikan**. Format bebas, tapi semakin detail semakin mudah developer fix.

### 12.1 Bug Ditemukan

| No | Halaman / Fitur | Apa yang terjadi | Apa yang seharusnya | Screenshot |
|----|-----------------|------------------|---------------------|-----------|
| 1 |  |  |  |  |
| 2 |  |  |  |  |
| 3 |  |  |  |  |

### 12.2 Saran Perbaikan UX

| No | Halaman / Fitur | Saran |
|----|-----------------|-------|
| 1 |  |  |
| 2 |  |  |
| 3 |  |  |

### 12.3 Hal Lain

```
(tulis bebas di sini — pertanyaan, ide fitur baru, konfirmasi sesuatu, dll)




```


---

## 13. Sign-Off Klien

Setelah selesai test dan tidak ada bug critical:

### Pernyataan Penerimaan

> Saya **(nama klien)**, sebagai pemilik / penanggung jawab proyek JayField, telah melakukan UAT terhadap website ini. Berdasarkan checklist di atas:
>
> ☐ Semua fitur **berfungsi dengan baik** dan saya **menerima** website ini siap untuk production launch.
>
> ☐ Ada beberapa catatan **minor** (di Section 12), saya menerima **dengan syarat** developer fix dulu sebelum launch.
>
> ☐ Ada **bug major** yang harus difix dulu sebelum saya menerima.

### Tanda Tangan

| | Nama | Tanggal | Tanda Tangan |
|---|------|---------|--------------|
| **Klien** | ___________ | ___________ | ___________ |
| **Developer** | ___________ | ___________ | ___________ |

---

## Setelah UAT Selesai

Kalau Anda **menerima** website ini:

1. Developer akan deploy ke production server
2. Developer akan handover akun admin (Anda yang ganti password admin)
3. Developer akan kasih panduan operasional (`PANDUAN-JAYFIELD.md`)
4. Mulai paket maintenance sesuai kontrak

Kalau ada **bug** yang perlu difix:

1. Developer fix bug yang dilaporkan di Section 12
2. Anda re-test bagian yang difix saja
3. Sign-off ulang setelah confirmed
4. Lanjut ke deploy

---

**Selamat ber-UAT! Jangan ragu tanya kalau ada yang bingung. 🎉⚽**

*Dokumen ini disusun untuk memudahkan klien melakukan uji coba terakhir sebelum serah-terima website.*

**Versi**: 1.0
**Tanggal**: 30 Mei 2026
**Disusun oleh**: QA Lead — JayField Development Team
