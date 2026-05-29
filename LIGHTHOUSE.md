# Lighthouse & Bundle Audit Notes

> Section 3.6 perf tuning. Documents the changes made to push Lighthouse
> public-page scores past 90 and how to verify locally.

## Targeted scores

| Category       | Goal | Key signal                                       |
| -------------- | ---- | ------------------------------------------------ |
| Performance    | ≥ 90 | LCP < 2.5s, TBT < 200ms, CLS < 0.1               |
| Accessibility  | ≥ 95 | Color contrast, alt text, aria labels            |
| Best Practices | ≥ 95 | HTTPS-only assets, no console errors             |
| SEO            | ≥ 95 | Meta description, viewport, mobile-friendly      |

## What we changed in 3.6

### ISR for cacheable pages
- `/(public)/page.tsx` — landing → 60s
- `/(public)/locations/page.tsx` → 60s
- `/(public)/promo/page.tsx` → 60s
- `/(public)/contact/page.tsx` → 3600s
- `/(public)/faq/page.tsx` → 3600s
- `app/sitemap.ts` → 3600s

Dashboard / admin / booking flow remain `force-dynamic` because they
rely on per-request session data.

### Image optimization
- `next.config.mjs` now ships with `formats: ["image/avif", "image/webp"]`
  and a locked `remotePatterns` allowlist (utfs.io + uploadthing + unsplash
  + Google avatars).
- Replaced raw `<img>` tags in landing and booking flow with `next/image`
  using `fill`, explicit `sizes`, and `loading="lazy"`.
- Court / location thumbnails sourced from UploadThing (utfs.io) are now
  routed through `next/image` and served as AVIF/WebP automatically.

### Code splitting
- `src/components/admin/reports/LazyCharts.tsx` defers recharts (~80KB)
  with `next/dynamic({ ssr: false })`. Reports page imports from this
  wrapper instead of the chart components directly.
- Skeleton placeholders show while the chart bundle hydrates.

### Database tuning
- Added DB indexes for hot paths — see `prisma/migrations/20260603000000_add_perf_indexes/migration.sql`.
- Existing API routes already use `Promise.all` for parallel reads and
  scope `select` clauses for hot queries (see `/api/admin/members`).

### Preconnect & viewport
- Root layout now declares the viewport in the `viewport` export with a
  themed color, plus `<link rel="preconnect">` for utfs.io and
  images.unsplash.com so the TLS handshake overlaps with HTML parsing.

## How to run a local audit

1. Build production bundle:
   ```
   npm run build
   npm start
   ```
2. Open `http://localhost:3000/id` in Chrome (incognito), DevTools →
   Lighthouse → Mobile → Performance + Accessibility + Best Practices +
   SEO. Run "Analyze page load".
3. Repeat on `/id/locations`, `/id/promo`, `/id/faq`, `/id/contact`.

## Bundle size analysis

`@next/bundle-analyzer` is wired up. To inspect the bundle:

```bash
ANALYZE=true npm run build
```

Three HTML reports open automatically (or check
`.next/analyze/{client,nodejs,edge}.html`):

- `client.html` — what ships to the browser per route
- `nodejs.html` — server-side route handlers
- `edge.html` — middleware / edge functions

## Caveats / not verifiable from code review alone

- Real Lighthouse scores require a browser run; CI can integrate
  `@lhci/cli` later if needed.
- Network-conditioned tests (3G slow) need DevTools throttling.
- Some screen-reader checks (focus order, aria-live) need manual review
  with NVDA / VoiceOver.
