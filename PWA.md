# PWA Guide — JayField

Catatan setup, testing, dan troubleshooting untuk fitur Progressive Web App
(manifest, service worker, offline support, push notifications).

---

## Kapabilitas

| Fitur                  | Status | Catatan                                                |
| ---------------------- | ------ | ------------------------------------------------------ |
| Web App Manifest       | ✅     | `src/app/manifest.ts` → `/manifest.webmanifest`        |
| Service Worker         | ✅     | `public/sw.js` (vanilla Cache API, no third-party)     |
| Offline halaman        | ✅     | `/[locale]/offline` (pre-cached oleh SW)               |
| Install prompt         | ✅     | Banner Chrome/Edge/Android (iOS Safari tidak dukung)   |
| Update prompt          | ✅     | Toast "Update sekarang" saat ada SW versi baru         |
| Network status         | ✅     | Indikator "Mode Offline" di top-bar                    |
| Push notifications     | ✅     | VAPID + `web-push`, opt-in di `/dashboard/profile`     |
| Offline booking history| ✅     | Cache localStorage + SW network-first untuk `/api/bookings` |

---

## Setup VAPID Keys (sekali per environment)

Push notifications butuh sepasang VAPID keys. Generate sekali, simpan di
`.env`, dan jangan ganti setelah ada subscription production (kalau diganti,
semua subscription lama akan invalid).

```bash
npm run vapid:generate
```

Output akan kelihatan seperti:

```
=== JayField VAPID Keys ===

VAPID_PUBLIC_KEY=BFx...
VAPID_PRIVATE_KEY=Yg...
VAPID_EMAIL=mailto:hello@jayfield.com
```

Copy semua ke `.env` lokal dan ke environment production (Vercel:
Settings → Environment Variables). Restart dev server setelah simpan.

> **Important:** `VAPID_PRIVATE_KEY` adalah secret. Jangan commit. Jangan
> kirim ke client. Hanya server-side `lib/push.ts` yang baca.

---

## Required Env Vars

```bash
VAPID_PUBLIC_KEY=...     # public key, dikirim ke browser
VAPID_PRIVATE_KEY=...    # SECRET, server-side only
VAPID_EMAIL=mailto:...   # contact untuk push provider
```

Tanpa keys ini, `sendPushNotification()` jadi no-op (return `{ sent: 0 }`)
sehingga app tetap jalan tapi notifikasi push tidak terkirim.

---

## Testing Push Notifications Locally

1. Pastikan `VAPID_*` ter-set di `.env`.
2. `npm run dev` lalu buka `http://localhost:3000` di Chrome/Edge.
3. Login sebagai user.
4. Buka `/dashboard/profile`, klik **Aktifkan** di section Push.
5. Trigger sebuah notification path — misalnya minta admin reject pembayaran
   booking kamu — atau panggil `createNotification()` langsung dari
   sebuah API/cron.
6. Notifikasi push akan muncul di OS-level. Klik akan buka tab baru di
   `actionUrl` (atau `/dashboard` kalau tidak diset).

> **Catatan dev:** Service Worker hanya register di `NODE_ENV=production`.
> Untuk test SW lengkap, jalankan:
>
> ```bash
> npm run build
> npm start
> ```

### Inspect via Chrome DevTools

- **Application → Manifest:** verify icon & shortcuts
- **Application → Service Workers:** lihat status, force update,
  unregister kalau perlu reset
- **Application → Cache Storage:** intip `jayfield-static-v1`,
  `jayfield-runtime-v1`, `jayfield-api-v1`
- **Application → Storage → Push Messaging:** kirim test push ke endpoint

---

## PWA Testing Checklist

- [ ] Lighthouse PWA audit ≥ 90 (Chrome DevTools → Lighthouse → PWA)
- [ ] Install banner muncul di Chrome desktop & Android
- [ ] Aplikasi berfungsi dalam display-mode standalone (terbuka dari home)
- [ ] Service Worker registered & activated (lihat DevTools)
- [ ] Manifest valid (no warnings di Manifest panel)
- [ ] Theme color & icon tampil di address bar / splash screen
- [ ] Offline page muncul saat network down
- [ ] `/dashboard/bookings` menampilkan data cache saat offline (kalau
      sebelumnya pernah dibuka online)
- [ ] Push permission dialog muncul saat klik Aktifkan
- [ ] Push notification muncul dari OS dengan icon + badge
- [ ] Klik notif buka URL yang benar dan focus existing tab kalau ada
- [ ] Update prompt muncul saat deploy versi baru (SW `installing` →
      `installed` saat controller already exists)

---

## Files yang Perlu Disiapkan User

Manifest mereferensi 4 ikon di root `/public`:

```
public/icon-192.png            (192×192, full bleed)
public/icon-512.png            (512×512, full bleed)
public/icon-maskable-192.png   (192×192, padded safe zone)
public/icon-maskable-512.png   (512×512, padded safe zone)
```

Tools rekomen untuk generate semua varian dari satu source:

- [maskable.app](https://maskable.app/) — preview & generate maskable
- [Real Favicon Generator](https://realfavicongenerator.net/) — full bundle
- `sharp-cli` atau ImageMagick kalau prefer CLI

Tanpa ikon-ikon ini, install banner masih akan muncul tapi tampilan home
screen-nya jelek.

---

## Cara Push Notification Terkirim

Setiap kali `createNotification()` dipanggil (di
`src/lib/notifications.ts`), helper:

1. Insert row `Notification` di DB
2. Optional: dispatch email via Resend
3. **Auto-dispatch web push** ke semua subscription user (best-effort,
   tidak akan throw kalau gagal)

Kalau mau opt-out push untuk notifikasi tertentu, pass `push: false`:

```ts
await createNotification({
  userId,
  title: "Internal note",
  message: "...",
  type: "SYSTEM",
  push: false,
});
```

---

## Troubleshooting

**Push permission denied di Chrome.** Browser ingat denial. User harus
manual reset via icon gembok di address bar → Notifications → Allow.

**SW tidak update setelah deploy.** Browser fetch `sw.js` dengan max-age
0 by default tapi sometimes cache. Bump `CACHE_VERSION` di `public/sw.js`
untuk force prune cache lama.

**Notifikasi push tidak muncul tapi `sendPushNotification` return 200.**
Cek apakah subscription masih valid — Push API endpoints expire setelah
beberapa hari di banyak browser. Helper auto-prune subscription yang
kembalikan 404/410, jadi kalau lama tidak terima notif, user perlu klik
"Aktifkan" lagi.

**SW broken di dev.** Memang sengaja — `ServiceWorkerProvider` skip
register kalau `NODE_ENV !== "production"` biar HMR tidak chaos. Test SW
lewat `npm run build && npm start`.
