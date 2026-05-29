# Keamanan & Maintenance JayField

Dokumen ini menjawab dua pertanyaan klien:
1. **Apakah website ini aman?**
2. **Bagaimana cara maintenance-nya?**

Ditulis untuk klien yang bukan developer. Bagian teknis di bawah dijelaskan dengan analogi sederhana.

---

## Bagian 1: Keamanan Website & Database

### Ringkasan Eksekutif (TL;DR untuk Klien)

> "Website ini sudah aman untuk dipakai produksi dengan standar industri. Password pelanggan tidak bisa dilihat siapapun (terenkripsi), data dikirim lewat HTTPS, ada proteksi terhadap spam dan brute force, dan database punya backup harian otomatis. Tingkat keamanan setara dengan website e-commerce kelas menengah. Untuk tumbuh ke skala lebih besar, ada beberapa upgrade opsional yang direkomendasikan — dijelaskan di bawah."

### Yang Sudah Aman

#### Password & Login

- **Password di-hash dengan bcrypt cost factor 12** — kalau database bocor pun, password asli tidak terbaca. Bcrypt adalah standar industri (dipakai oleh perusahaan besar).
- **Tidak menyimpan password plain text** — bahkan kami sebagai developer tidak bisa melihat password pelanggan.
- **Login bisa via Google OAuth** — pelanggan tidak perlu bikin password baru, pakai akun Google mereka langsung.
- **Session token aman** — disimpan di JWT cookie (HttpOnly, secure di production), tidak bisa diakses JavaScript jahat.
- **Session expired otomatis 7 hari** — setelah itu wajib login ulang.


#### Proteksi Brute Force & Spam

- **Rate limiting** di endpoint sensitive:
  - Login: 10 percobaan / 5 menit per IP
  - Register: 5 akun baru / 15 menit per IP
  - Forgot password: 5 request / 15 menit per IP
  - Booking: 20 booking / 5 menit per user
- Kalau pelanggan mencoba login berulang dengan password salah, sistem otomatis blok sementara.

#### Akses Berbasis Role

- **3 level akses**: Admin / Staff / User
- Setiap halaman & API divalidasi role-nya di server (bukan cuma di UI).
- **Self-protection**: admin tidak bisa nonaktifkan dirinya sendiri.
- **Last-admin protection**: tidak bisa menghapus admin terakhir (mencegah lock-out).
- API admin yang sensitif (kelola user, settings, hapus data) hanya bisa diakses oleh admin.

#### Validasi Input

- **Semua form & API divalidasi pakai Zod schema** — input nakal (XSS payload, SQL injection attempt) ditolak sebelum masuk database.
- **Prisma ORM** otomatis melindungi dari SQL injection (semua query parameterized).
- **Email format, panjang password, angka, tanggal** — semua dicek di server.


#### Komunikasi Aman

- **HTTPS otomatis** dari Vercel + custom domain dengan SSL gratis.
- **Cookies dengan flag Secure + HttpOnly + SameSite** — tidak bisa dicuri lewat JavaScript jahat atau diserang dari domain lain.
- **CSRF protection** built-in dari NextAuth.

#### Database (Supabase Postgres)

- **Hosted di Supabase** — provider profesional dengan backup harian otomatis.
- **Connection pooling** untuk performance & limit koneksi.
- **Row-level security** bisa di-enable per tabel (saat ini reliance ke server-side auth check).
- **Backup harian otomatis** — bisa restore data 7 hari ke belakang (free tier) atau lebih lama (paid).
- **Encrypted at rest** — file database di server Supabase terenkripsi.

#### Pembayaran

- **Tidak menyimpan data kartu kredit** — pembayaran via transfer manual, hanya foto bukti yang disimpan (di UploadThing CDN).
- **Bukti transfer hanya bisa diakses oleh user pemilik booking + admin/staff**.
- File upload divalidasi tipe & ukuran (max 4 MB image only).

#### Bukti Audit

- **Audit log** di tabel PointsHistory untuk semua perubahan poin (siapa, kapan, kenapa).
- **Booking history** lengkap dengan timestamp.
- **Refund state machine** — perubahan status tercatat dengan processed_by (siapa yang approve).


### Yang Masih Bisa Ditingkatkan (Rekomendasi Upgrade)

Tingkat keamanan saat ini sudah cocok untuk **bisnis kecil-menengah dengan traffic 1.000-10.000 pelanggan**. Kalau bisnis tumbuh lebih besar atau ada concern khusus, ini upgrade yang direkomendasikan:

#### Prioritas Tinggi (sebaiknya dilakukan sebelum launch ke publik)

1. **Email verification saat register** — saat ini akun baru langsung aktif. Sebaiknya kirim email konfirmasi dulu sebelum bisa login. Mencegah akun bot.
2. **Verifikasi nomor HP** (OTP via WhatsApp/SMS) — untuk transaksi sensitif. Butuh integrasi 3rd party (Fonnte, Twilio) berbayar.
3. **HTTPS dengan HSTS header** — paksa browser selalu pakai HTTPS. Tinggal tambah security header di config.
4. **Content Security Policy (CSP)** — tambahan proteksi XSS layer 2. Tinggal tambah header.
5. **Ganti default password admin/staff/user** sebelum diserahkan ke klien — wajib.
6. **Set environment variable production** terpisah dari development:
   - `NEXTAUTH_SECRET` random 32+ karakter (bukan default)
   - `CRON_SECRET` random 32+ karakter
   - Database URL production yang berbeda dari development

#### Prioritas Sedang

7. **Rate limiter pakai Redis (Upstash)** — saat ini in-memory per server instance. Multi-instance deployment butuh shared state. Cocok kalau traffic > 1000 user concurrent.
8. **2FA / Two-Factor Auth untuk admin** — login admin extra aman dengan kode dari Google Authenticator. Tambahan ~3 hari development.
9. **Audit log lengkap** — log semua perubahan settings, harga, lapangan, dengan info siapa & kapan. Mempermudah forensic kalau ada masalah.
10. **WAF (Web Application Firewall)** — filter request mencurigakan di level edge. Vercel Pro plan punya bawaan, atau Cloudflare gratis.


#### Prioritas Rendah (untuk skala enterprise)

11. **Penetration testing** — sewa pihak ketiga untuk hacking simulasi. Biaya 5-50 juta tergantung scope.
12. **GDPR compliance** — kalau target user ke EU. Butuh privacy policy, consent banner, data deletion endpoint.
13. **Database encryption at app level** — encrypt field sensitive (nomor HP, alamat). Saat ini hanya at-rest di Supabase.
14. **Monitoring & alerting** — Sentry untuk error tracking, UptimeRobot untuk monitoring downtime, Better Stack untuk log aggregation.
15. **Compliance audit** (PCI DSS, ISO 27001) — untuk klien enterprise / pemerintah.

### Cara Menjelaskan ke Klien (Talking Points)

Saat klien tanya **"Apakah aman?"**, jawab dengan struktur ini:

> "Ya, website ini sudah aman dengan standar industri:
>
> 1. **Password pelanggan terenkripsi** dengan algoritma yang dipakai oleh bank-bank.
> 2. **Komunikasi pakai HTTPS** sehingga data tidak bisa dicegat saat dikirim.
> 3. **Ada proteksi anti-spam dan anti brute-force** — orang tidak bisa coba-coba login berulang.
> 4. **Database di-host di Supabase** — provider profesional dengan backup harian otomatis.
> 5. **Akses berjenjang** — staff hanya bisa lihat hal yang mereka perlu, admin punya akses penuh.
> 6. **Tidak menyimpan data kartu kredit** karena pembayaran via transfer manual.
>
> Untuk skala bisnis Bapak/Ibu (estimasi X pelanggan/bulan), keamanan ini sudah cukup. Kalau ke depan tumbuh lebih besar, ada beberapa upgrade yang bisa kita tambahkan secara bertahap — misalnya 2FA untuk admin atau monitoring otomatis. Detailnya saya kasih dokumen."

Lalu kasih dokumen ini.


### Jika Klien Khawatir Spesifik

| Kekhawatiran Klien | Jawaban |
|--------------------|---------|
| "Password pelanggan kalau bocor gimana?" | "Password tidak disimpan dalam bentuk asli. Bahkan kalau database bocor, hacker hanya dapat hash bcrypt — butuh ratusan tahun untuk crack." |
| "Bisa di-hack ga?" | "Tidak ada website yang 100% aman. Tapi website ini punya layer-layer proteksi standar industri. Kami bisa tingkatkan terus secara bertahap kalau bisnis tumbuh." |
| "Kalau ada yang spam booking gimana?" | "Ada rate limiting — maksimal 20 booking per 5 menit per user. Lebih dari itu otomatis ditolak." |
| "Data pelanggan bisa di-export ga sama orang luar?" | "Tidak. Hanya admin yang bisa export, dan admin login pakai password yang dikontrol klien." |
| "Bagaimana kalau saya lupa password admin?" | "Klik 'Lupa Password', sistem kirim link reset ke email. Atau kontak developer untuk reset manual via database." |
| "Database bisa hilang ga?" | "Supabase backup harian otomatis. Bisa restore data 7 hari ke belakang gratis, atau lebih lama dengan paid plan." |

---

## Bagian 2: Maintenance Website

### Konsep: Apa itu Maintenance?

Maintenance website mirip dengan maintenance mobil — bukan sekali pasang lalu lupa. Tetap perlu cek berkala supaya:
- Tidak ada bug yang muncul karena perubahan eksternal (browser update, dependency security patch)
- Database tetap sehat (tidak penuh, tidak lambat)
- Backup berjalan
- Fitur baru bisa ditambah tanpa nge-break yang lama

### Maintenance Rutin (Harian / Mingguan)

Sebagian besar otomatis. Anda atau staff hanya perlu cek dashboard.

| Kapan | Yang Dicek | Otomatis? |
|-------|------------|-----------|
| **Setiap hari** | Pending payment yang belum dikonfirmasi | Manual cek di `/admin/payments` |
| **Setiap hari** | Booking pending yang belum dibayar (auto-cancel setelah 1 jam) | ✅ Otomatis (cron tiap 5 menit) |
| **Setiap hari** | Reminder H-1 ke pelanggan | ✅ Otomatis (cron tiap 18:00 WIB) |
| **Setiap 30 menit** | Booking selesai → mark COMPLETED + award poin + tier upgrade | ✅ Otomatis (cron) |
| **Setiap hari** | Generate booking recurring untuk minggu depan | ✅ Otomatis (cron tiap 00:01 WIB) |
| **Setiap minggu** | Cleanup notifikasi yang sudah dibaca > 30 hari | ✅ Otomatis (cron tiap Minggu 18:00) |
| **Setiap hari** | Backup database | ✅ Otomatis (Supabase) |
| **Mingguan** | Cek refund pending yang belum di-process | Manual cek di `/admin/refunds` |
| **Mingguan** | Cek laporan revenue & occupancy | Manual lihat `/admin/reports` |


### Maintenance Bulanan

Yang ini perlu campur tangan developer.

1. **Update dependencies** (~30 menit)
   - Cek package npm yang perlu di-update
   - Update yang aman (patch version), test
   - Update major version dengan hati-hati (bisa breaking)

2. **Cek security advisories** (~15 menit)
   - Jalankan `npm audit`
   - Apply security patches kalau ada vulnerability

3. **Review error log** (~30 menit)
   - Cek Vercel function logs untuk error berulang
   - Identifikasi pattern yang perlu diperbaiki

4. **Database health check** (~15 menit)
   - Cek storage usage di Supabase
   - Cek slow queries (kalau ada)
   - Optimize index kalau perlu

5. **Test critical flow manual** (~30 menit)
   - Coba register, login, booking, payment, cancel
   - Pastikan masih jalan dengan baik

**Total: ~2 jam per bulan untuk maintenance dasar.**

### Maintenance Triwulanan / Per 3 Bulan

1. **Performance audit** (Lighthouse) — pastikan score masih > 90
2. **Database backup test** — coba restore ke staging untuk pastikan backup beneran berfungsi
3. **Penetration test sederhana** — review log untuk pattern serangan
4. **Review user feedback** — fitur apa yang sering diminta
5. **Review competitor** — apakah ada fitur baru yang perlu di-add

### Maintenance Tahunan

1. **SSL certificate renewal** — auto via Vercel, tinggal cek tidak ada warning
2. **Domain renewal** — bayar tahunan ke registrar
3. **Major version upgrade** — Next.js, Prisma, NextAuth (perlu testing menyeluruh)
4. **Audit kode menyeluruh** — refactor area yang sudah berkembang banyak
5. **Compliance review** — privacy policy, terms of service kalau ada perubahan UU


### Estimasi Biaya Operasional Bulanan

| Item | Free Tier | Estimasi Saat Tumbuh |
|------|-----------|----------------------|
| **Hosting (Vercel)** | Free 100 GB bandwidth | $20/bulan (Pro plan) |
| **Database (Supabase)** | Free 500 MB | $25/bulan (Pro plan) |
| **File Storage (UploadThing)** | Free 2 GB | $10/bulan (paid plan) |
| **Email (Resend)** | Free 3000 email/bulan | $20/bulan (50k email) |
| **Domain** | - | ~$10-15/tahun (~Rp 130-200rb) |
| **WhatsApp API (opsional)** | - | $20/bulan (Fonnte/Wablas) |
| **Monitoring (Sentry, opsional)** | Free 5000 events | $26/bulan |

**Total realistis untuk bisnis kecil-menengah**: $0-30/bulan di awal, naik ke $75-100/bulan saat tumbuh.

### Estimasi Biaya Maintenance Developer

Tergantung kontrak yang Anda tawarkan ke klien. Pilihan umum:

| Paket | Yang Termasuk | Estimasi Harga (per bulan) |
|-------|---------------|----------------------------|
| **Basic** | Bug fix urgent, monitoring uptime | Rp 1-2 juta |
| **Standard** | Basic + update dependencies bulanan + small features | Rp 3-5 juta |
| **Premium** | Standard + custom feature development + priority response | Rp 7-15 juta |
| **On-demand** | Per-task / per-jam | Rp 200-500rb/jam |

Sesuaikan dengan kompleksitas bisnis klien & kemampuan budget mereka.


### Cara Menjelaskan Maintenance ke Klien

Saat klien tanya **"Habis beli ini perlu maintain ga?"**, jawab:

> "Ya, seperti website pada umumnya. Tapi sebagian besar otomatis. Yang manual cuma:
>
> 1. **Konfirmasi pembayaran masuk** — staff Anda cek dashboard 1-2x sehari, klik approve.
> 2. **Approve refund** — kalau ada pembatalan, admin verifikasi dan transfer balik.
> 3. **Update fitur kalau bisnis berkembang** — misal nambah lokasi, ubah harga, bikin promo baru.
>
> Yang otomatis dijalankan sistem:
> - Auto-cancel booking yang tidak bayar dalam 1 jam
> - Kirim reminder H-1 ke pelanggan
> - Backup database harian
> - Hitung poin & naik tier member
> - Generate booking recurring
>
> Untuk maintenance teknis (update software, security patch, fix bug), kami punya 4 paket maintenance — basic Rp X juta/bulan sampai premium Rp Y juta/bulan. Atau on-demand per-task. Biasanya bisnis kecil cukup pakai paket Standard."

### Daily Checklist untuk Owner / Admin (3 menit)

Print atau pin di dashboard, isi setiap pagi:

```
□ Buka /admin
□ Cek "Pending Payments" — ada yang nunggu konfirmasi?
□ Cek "Today Bookings" — ada masalah di jadwal?
□ Cek notification bell — ada notifikasi penting?
□ Kalau ada refund REQUESTED, klik approve / reject
□ Reply ke customer support (kalau ada chat / email masuk)
```

### Weekly Checklist (15 menit)

```
□ Lihat /admin/reports → revenue minggu ini vs minggu lalu
□ Cek occupancy rate per court → ada yang underperforming?
□ Review members list → ada yang naik tier? Selamat lewat WhatsApp.
□ Cek /admin/promos → promo expired? Bikin baru?
□ Review /admin/reviews → ada review buruk yang perlu di-handle?
```


### Disaster Recovery (Kalau Terjadi Hal Buruk)

| Skenario | Tindakan |
|----------|----------|
| **Website down** (tidak bisa diakses) | Cek status.vercel.com, status.supabase.com. Hubungi developer kalau bukan masalah platform. |
| **Database corrupt / data hilang** | Restore dari backup Supabase. Bisa lewat Supabase dashboard. Maksimal kehilangan data 24 jam (sesuai backup harian). |
| **Domain expired** | Renew di registrar. Sebaiknya set auto-renew. |
| **SSL expired** | Auto-renew dari Vercel. Kalau tidak, hubungi developer. |
| **Lupa password admin** | Klik "Lupa Password" di login. Atau developer reset manual via database. |
| **Akun developer kompromi** | Ganti semua password env (NEXTAUTH_SECRET, DATABASE_URL, dll), rotate API keys, audit log. |
| **Pelanggan komplain "uang udah ditransfer tapi booking ga confirmed"** | Cek bukti transfer di /admin/payments. Kalau valid, manual confirm. Kalau tidak valid, reject dengan alasan. |
| **Pelanggan komplain duplicate booking** | Cek di /admin/bookings, refund yang dobel pakai flow refund. |
| **Spam booking** | Cek log Vercel, identifikasi IP/akun penyerang, blok via /admin/users (deactivate). |

---

## Penutup

### Yang Saya Sarankan Sebelum Serah-Terima ke Klien

1. **Ganti semua default password** (admin/staff/user)
2. **Set environment variable production** dengan secret yang random
3. **Setup custom domain** sesuai brand klien
4. **Setup email sender (Resend)** dengan domain yang sudah verified
5. **Buat 3 dokumen ini sebagai handover package**:
   - `PANDUAN-JAYFIELD.md` — cara pakai website
   - `KEAMANAN-DAN-MAINTENANCE.md` — dokumen ini
   - SLA / kontrak maintenance — sesuaikan dengan paket yang dipilih klien
6. **Training tatap muka 1-2 jam** untuk admin & staff klien
7. **Trial period 1 bulan** dengan support gratis untuk catch issue awal
8. **Backup pertama manual** sebelum klien mulai pakai (rollback point yang aman)

### Setelah Serah-Terima

1. **Bulan 1**: Daily check-in, fix bug urgent gratis
2. **Bulan 2-3**: Weekly check-in, training tambahan kalau perlu
3. **Bulan 4+**: Sesuai paket maintenance yang disepakati

---

*Dokumen ini bisa Anda customize sesuai kebutuhan klien sebelum dikirim. Kalau klien punya concern spesifik yang tidak tercover di sini, tambahkan di section FAQ.*

**Versi:** 1.0
**Update terakhir:** 29 Mei 2026
