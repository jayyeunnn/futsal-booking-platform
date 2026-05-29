# Technical Design Document (TDD)
# JayField — Website Booking Lapangan Futsal

---

## 1. System Architecture

### 1.1 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                   │
│         Next.js App (SSR/CSR) + Tailwind CSS         │
└─────────────────────┬───────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────────┐
│                 NEXT.JS SERVER                        │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │
│  │  App Router  │  │ API Routes  │  │  NextAuth  │  │
│  │  (Pages/UI)  │  │ (REST API)  │  │  (Auth)    │  │
│  └─────────────┘  └──────┬──────┘  └────────────┘  │
│                           │                          │
│  ┌────────────────────────▼──────────────────────┐  │
│  │              PRISMA ORM (Type-safe)            │  │
│  └────────────────────────┬──────────────────────┘  │
└───────────────────────────┼──────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────┐
│              PostgreSQL Database                       │
│         (Supabase / Railway / Neon)                   │
└──────────────────────────────────────────────────────┘

External Services:
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Resend API  │  │ Google OAuth │  │  Vercel CDN  │
│  (Email)     │  │  (Auth)      │  │  (Hosting)   │
└──────────────┘  └──────────────┘  └──────────────┘
```


### 1.2 Tech Stack Detail

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Runtime | Node.js | 20.x LTS | Server runtime |
| Framework | Next.js | 14.x (App Router) | Full-stack React framework |
| Language | TypeScript | 5.x | Type safety |
| Styling | Tailwind CSS | 3.x | Utility-first CSS |
| UI Library | shadcn/ui | latest | Accessible component library |
| ORM | Prisma | 5.x | Type-safe database access |
| Database | PostgreSQL | 15+ | Primary data store |
| Auth | NextAuth.js | 5.x (Auth.js) | Authentication & session |
| Email | Resend | latest | Transactional emails |
| i18n | next-intl | latest | Internationalization (ID/EN) |
| Validation | Zod | 3.x | Schema validation |
| State | Zustand | 4.x | Client-side state management |
| File Upload | UploadThing / Cloudinary | latest | Image upload (bukti transfer, foto) |
| Date | date-fns | latest | Date manipulation |
| Icons | Lucide React | latest | Icon library |

---

## 2. Project Folder Structure

```
booking-futsal/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Seed data
│   └── migrations/            # Auto-generated migrations
├── public/
│   ├── images/                # Static images
│   ├── icons/                 # Favicon, app icons
│   └── locales/               # i18n translation files (if static)
├── src/
│   ├── app/
│   │   ├── [locale]/          # Locale prefix (id/en)
│   │   │   ├── (public)/      # Public pages (no auth required)
│   │   │   │   ├── page.tsx                # Landing page
│   │   │   │   ├── locations/page.tsx      # Locations list
│   │   │   │   ├── promo/page.tsx          # Promo & events
│   │   │   │   ├── faq/page.tsx            # FAQ
│   │   │   │   └── contact/page.tsx        # Contact
│   │   │   ├── (auth)/        # Auth pages
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── register/page.tsx
│   │   │   │   └── forgot-password/page.tsx
│   │   │   ├── booking/       # Booking flow
│   │   │   │   ├── page.tsx               # Select location
│   │   │   │   ├── [locationId]/page.tsx  # Select court
│   │   │   │   ├── [locationId]/[courtId]/page.tsx # Select schedule
│   │   │   │   └── confirm/page.tsx       # Confirm & pay
│   │   │   ├── dashboard/     # User dashboard (protected)
│   │   │   │   ├── page.tsx               # Overview
│   │   │   │   ├── bookings/page.tsx
│   │   │   │   ├── membership/page.tsx
│   │   │   │   ├── points/page.tsx
│   │   │   │   ├── notifications/page.tsx
│   │   │   │   ├── profile/page.tsx
│   │   │   │   └── favorites/page.tsx
│   │   │   └── admin/         # Admin dashboard (protected, role-based)
│   │   │       ├── page.tsx               # Admin overview
│   │   │       ├── bookings/page.tsx
│   │   │       ├── payments/page.tsx
│   │   │       ├── courts/page.tsx
│   │   │       ├── locations/page.tsx
│   │   │       ├── pricing/page.tsx
│   │   │       ├── members/page.tsx
│   │   │       ├── promos/page.tsx
│   │   │       ├── reports/page.tsx
│   │   │       ├── refunds/page.tsx
│   │   │       ├── users/page.tsx
│   │   │       └── settings/page.tsx
│   │   ├── api/               # API Routes
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── bookings/route.ts
│   │   │   ├── courts/route.ts
│   │   │   ├── locations/route.ts
│   │   │   ├── payments/route.ts
│   │   │   ├── members/route.ts
│   │   │   ├── notifications/route.ts
│   │   │   ├── promos/route.ts
│   │   │   ├── refunds/route.ts
│   │   │   ├── reviews/route.ts
│   │   │   └── upload/route.ts
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── layout/            # Navbar, Footer, Sidebar
│   │   ├── landing/           # Landing page sections
│   │   ├── booking/           # Booking-related components
│   │   ├── dashboard/         # User dashboard components
│   │   ├── admin/             # Admin dashboard components
│   │   └── shared/            # Shared/reusable components
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client instance
│   │   ├── auth.ts            # Auth configuration
│   │   ├── email.ts           # Email service
│   │   ├── utils.ts           # Utility functions
│   │   ├── validations/       # Zod schemas
│   │   └── constants.ts       # App constants
│   ├── hooks/                 # Custom React hooks
│   ├── store/                 # Zustand stores
│   ├── types/                 # TypeScript type definitions
│   ├── messages/              # i18n translation files
│   │   ├── id.json
│   │   └── en.json
│   └── middleware.ts          # Auth & i18n middleware
├── .env                       # Environment variables (local)
├── .env.example               # Env template
├── next.config.js             # Next.js config
├── tailwind.config.ts         # Tailwind config
├── tsconfig.json              # TypeScript config
├── package.json
└── README.md
```


---

## 3. Database Schema (Detailed)

### 3.1 Entity Relationship Diagram (ERD)

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  users   │────<│ bookings │>────│  courts  │
└──────────┘     └──────────┘     └──────────┘
     │                │                 │
     │           ┌────▼─────┐          │
     │           │ payments │          │
     │           └────┬─────┘     ┌────▼─────┐
     │                │           │ locations │
     │           ┌────▼─────┐    └──────────┘
     │           │  refunds  │
     │           └───────────┘
     │
     ├────<┌────────────────┐
     │     │ points_history │
     │     └────────────────┘
     │
     ├────<┌────────────────┐
     │     │ notifications  │
     │     └────────────────┘
     │
     └────<┌──────────┐
           │ reviews  │>────── courts
           └──────────┘
```

### 3.2 Table Definitions

#### `users`
```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255),          -- NULL jika login via OAuth
  name            VARCHAR(100) NOT NULL,
  phone           VARCHAR(20),
  avatar_url      VARCHAR(500),
  role            ENUM('USER', 'STAFF', 'ADMIN') DEFAULT 'USER',
  tier            ENUM('BRONZE', 'SILVER', 'GOLD') DEFAULT 'BRONZE',
  total_points    INTEGER DEFAULT 0,
  total_bookings  INTEGER DEFAULT 0,
  provider        VARCHAR(50),            -- 'google', 'credentials'
  provider_id     VARCHAR(255),           -- OAuth provider ID
  email_verified  BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

#### `locations`
```sql
CREATE TABLE locations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(200) NOT NULL,
  address         TEXT NOT NULL,
  city            VARCHAR(100) NOT NULL,
  latitude        DECIMAL(10, 8),
  longitude       DECIMAL(11, 8),
  phone           VARCHAR(20),
  email           VARCHAR(255),
  open_time       TIME NOT NULL DEFAULT '08:00',
  close_time      TIME NOT NULL DEFAULT '00:00',
  thumbnail_url   VARCHAR(500),
  description     TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

#### `courts`
```sql
CREATE TABLE courts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id     UUID NOT NULL REFERENCES locations(id),
  name            VARCHAR(100) NOT NULL,
  type            ENUM('INDOOR', 'OUTDOOR') NOT NULL,
  surface         VARCHAR(50),            -- 'synthetic_grass', 'vinyl', 'cement'
  capacity        INTEGER DEFAULT 10,     -- max players
  facilities      JSONB,                  -- ["parkir", "mushola", "kantin", "toilet"]
  photos          JSONB,                  -- array of photo URLs
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

#### `pricing`
```sql
CREATE TABLE pricing (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id        UUID NOT NULL REFERENCES courts(id),
  day_type        ENUM('WEEKDAY', 'WEEKEND') NOT NULL,
  time_type       ENUM('REGULAR', 'PRIME_TIME') NOT NULL,
  start_hour      TIME NOT NULL,          -- e.g., '08:00' for regular
  end_hour        TIME NOT NULL,          -- e.g., '16:00' for regular
  price_per_hour  DECIMAL(12, 2) NOT NULL,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

#### `bookings`
```sql
CREATE TABLE bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  court_id        UUID NOT NULL REFERENCES courts(id),
  booking_date    DATE NOT NULL,
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  duration_hours  DECIMAL(3, 1) NOT NULL,  -- 1.0, 1.5, 2.0, etc.
  total_price     DECIMAL(12, 2) NOT NULL,
  dp_amount       DECIMAL(12, 2),          -- NULL jika bayar full
  payment_type    ENUM('DP', 'FULL') NOT NULL,
  status          ENUM('PENDING_PAYMENT', 'PENDING_CONFIRMATION', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'EXPIRED') DEFAULT 'PENDING_PAYMENT',
  notes           TEXT,
  cancelled_at    TIMESTAMP,
  cancel_reason   TEXT,
  is_recurring    BOOLEAN DEFAULT FALSE,
  recurring_id    UUID REFERENCES recurring_bookings(id),
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Index for availability check
CREATE INDEX idx_bookings_court_date ON bookings(court_id, booking_date, status);
CREATE INDEX idx_bookings_user ON bookings(user_id, status);
```

#### `recurring_bookings`
```sql
CREATE TABLE recurring_bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  court_id        UUID NOT NULL REFERENCES courts(id),
  day_of_week     INTEGER NOT NULL,        -- 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  start_date      DATE NOT NULL,           -- recurring mulai dari tanggal ini
  end_date        DATE,                    -- NULL = berlaku sampai dibatalkan
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

#### `payments`
```sql
CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID NOT NULL REFERENCES bookings(id),
  amount          DECIMAL(12, 2) NOT NULL,
  payment_method  VARCHAR(50) NOT NULL,    -- 'BCA', 'BNI', 'MANDIRI', 'BRI', 'DANA', 'OVO', 'GOPAY'
  payment_type    ENUM('DP', 'FULL', 'SETTLEMENT') NOT NULL,
  proof_image_url VARCHAR(500),
  status          ENUM('PENDING', 'UPLOADED', 'CONFIRMED', 'REJECTED', 'EXPIRED') DEFAULT 'PENDING',
  confirmed_by    UUID REFERENCES users(id),  -- admin/staff yang konfirmasi
  confirmed_at    TIMESTAMP,
  expires_at      TIMESTAMP NOT NULL,      -- batas waktu upload bukti (1 jam)
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

#### `refunds`
```sql
CREATE TABLE refunds (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id      UUID NOT NULL REFERENCES payments(id),
  booking_id      UUID NOT NULL REFERENCES bookings(id),
  user_id         UUID NOT NULL REFERENCES users(id),
  amount          DECIMAL(12, 2) NOT NULL,
  refund_percentage INTEGER NOT NULL,      -- 50 or 100
  reason          TEXT NOT NULL,
  status          ENUM('REQUESTED', 'APPROVED', 'REJECTED', 'PROCESSED') DEFAULT 'REQUESTED',
  bank_name       VARCHAR(50),
  account_number  VARCHAR(50),
  account_holder  VARCHAR(100),
  processed_by    UUID REFERENCES users(id),
  processed_at    TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

#### `points_history`
```sql
CREATE TABLE points_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  amount          INTEGER NOT NULL,        -- positive = earned, negative = redeemed
  type            ENUM('EARNED_BOOKING', 'EARNED_REVIEW', 'EARNED_REFERRAL', 'EARNED_BONUS', 'REDEEMED_DISCOUNT', 'REDEEMED_FREE_SESSION', 'REDEEMED_MERCHANDISE', 'ADMIN_ADJUST') NOT NULL,
  description     VARCHAR(255),
  reference_id    UUID,                    -- booking_id, review_id, etc.
  created_at      TIMESTAMP DEFAULT NOW()
);
```

#### `notifications`
```sql
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  title           VARCHAR(200) NOT NULL,
  message         TEXT NOT NULL,
  type            ENUM('BOOKING', 'PAYMENT', 'PROMO', 'MEMBERSHIP', 'SYSTEM') NOT NULL,
  is_read         BOOLEAN DEFAULT FALSE,
  action_url      VARCHAR(500),            -- link to related page
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
```

#### `promos`
```sql
CREATE TABLE promos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            VARCHAR(50) UNIQUE NOT NULL,
  title           VARCHAR(200) NOT NULL,
  description     TEXT,
  discount_type   ENUM('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL,
  discount_value  DECIMAL(12, 2) NOT NULL,
  min_booking     DECIMAL(12, 2),          -- minimum total booking
  max_discount    DECIMAL(12, 2),          -- max discount amount (for percentage)
  usage_limit     INTEGER,                 -- total usage limit
  usage_count     INTEGER DEFAULT 0,
  per_user_limit  INTEGER DEFAULT 1,
  member_only     BOOLEAN DEFAULT FALSE,
  min_tier        ENUM('BRONZE', 'SILVER', 'GOLD'),
  start_date      TIMESTAMP NOT NULL,
  end_date        TIMESTAMP NOT NULL,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

#### `reviews`
```sql
CREATE TABLE reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  court_id        UUID NOT NULL REFERENCES courts(id),
  booking_id      UUID NOT NULL REFERENCES bookings(id),
  rating          INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment         TEXT,
  is_visible      BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, booking_id)             -- 1 review per booking
);
```

#### `payment_methods` (configurable by admin)
```sql
CREATE TABLE payment_methods (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(50) NOT NULL,    -- 'BCA', 'DANA', etc.
  type            ENUM('BANK_TRANSFER', 'E_WALLET') NOT NULL,
  account_number  VARCHAR(50) NOT NULL,
  account_holder  VARCHAR(100) NOT NULL,
  logo_url        VARCHAR(500),
  is_active       BOOLEAN DEFAULT TRUE,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMP DEFAULT NOW()
);
```

#### `app_settings` (configurable)
```sql
CREATE TABLE app_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key             VARCHAR(100) UNIQUE NOT NULL,
  value           TEXT NOT NULL,
  description     VARCHAR(255),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Default settings:
-- dp_percentage: 50
-- payment_deadline_minutes: 60
-- refund_policy_h1: 100
-- refund_policy_same_day_3h: 50
-- refund_policy_less_3h: 0
-- points_per_hour: 10
-- points_review: 5
-- points_referral: 20
-- points_bonus_off_peak: 5
-- silver_threshold_bookings: 15
-- silver_threshold_points: 500
-- gold_threshold_bookings: 30
-- gold_threshold_points: 1500
```


---

## 4. API Endpoints

### 4.1 Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login with credentials | Public |
| POST | `/api/auth/forgot-password` | Request password reset | Public |
| POST | `/api/auth/reset-password` | Reset password with token | Public |
| GET | `/api/auth/session` | Get current session | Authenticated |
| POST | `/api/auth/signout` | Sign out | Authenticated |

### 4.2 Locations

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/locations` | List all active locations | Public |
| GET | `/api/locations/[id]` | Get location detail | Public |
| POST | `/api/locations` | Create location | Admin |
| PUT | `/api/locations/[id]` | Update location | Admin |
| DELETE | `/api/locations/[id]` | Soft delete location | Admin |

### 4.3 Courts

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/courts?locationId=xxx` | List courts by location | Public |
| GET | `/api/courts/[id]` | Get court detail + pricing | Public |
| GET | `/api/courts/[id]/availability?date=xxx` | Get availability for a date | Public |
| POST | `/api/courts` | Create court | Admin |
| PUT | `/api/courts/[id]` | Update court | Admin |
| DELETE | `/api/courts/[id]` | Soft delete court | Admin |

### 4.4 Bookings

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/bookings` | List user's bookings | Authenticated |
| GET | `/api/bookings/[id]` | Get booking detail | Authenticated |
| POST | `/api/bookings` | Create new booking | Authenticated |
| PUT | `/api/bookings/[id]/cancel` | Cancel booking | Authenticated |
| GET | `/api/admin/bookings` | List all bookings (filtered) | Admin/Staff |
| PUT | `/api/admin/bookings/[id]/confirm` | Confirm booking | Admin/Staff |
| PUT | `/api/admin/bookings/[id]/reject` | Reject booking | Admin/Staff |

### 4.5 Recurring Bookings

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/recurring-bookings` | List user's recurring bookings | Authenticated |
| POST | `/api/recurring-bookings` | Create recurring booking | Authenticated |
| PUT | `/api/recurring-bookings/[id]` | Update recurring booking | Authenticated |
| DELETE | `/api/recurring-bookings/[id]` | Cancel recurring booking | Authenticated |

### 4.6 Payments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/payments/[bookingId]` | Get payment info for booking | Authenticated |
| POST | `/api/payments/upload-proof` | Upload payment proof | Authenticated |
| GET | `/api/admin/payments` | List pending payments | Admin/Staff |
| PUT | `/api/admin/payments/[id]/confirm` | Confirm payment | Admin/Staff |
| PUT | `/api/admin/payments/[id]/reject` | Reject payment | Admin/Staff |

### 4.7 Refunds

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/refunds` | Request refund | Authenticated |
| GET | `/api/refunds` | List user's refund requests | Authenticated |
| GET | `/api/admin/refunds` | List all refund requests | Admin |
| PUT | `/api/admin/refunds/[id]/approve` | Approve refund | Admin |
| PUT | `/api/admin/refunds/[id]/reject` | Reject refund | Admin |
| PUT | `/api/admin/refunds/[id]/process` | Mark refund as processed | Admin |

### 4.8 Members & Points

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/members/profile` | Get member profile (tier, points) | Authenticated |
| GET | `/api/members/points-history` | Get points history | Authenticated |
| POST | `/api/members/redeem` | Redeem points for reward | Authenticated |
| GET | `/api/admin/members` | List all members | Admin |
| PUT | `/api/admin/members/[id]/adjust-points` | Manual point adjustment | Admin |

### 4.9 Notifications

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/notifications` | List user's notifications | Authenticated |
| GET | `/api/notifications/unread-count` | Get unread count | Authenticated |
| PUT | `/api/notifications/[id]/read` | Mark as read | Authenticated |
| PUT | `/api/notifications/read-all` | Mark all as read | Authenticated |

### 4.10 Reviews

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/reviews?courtId=xxx` | List reviews for court | Public |
| POST | `/api/reviews` | Create review (after booking completed) | Authenticated |
| DELETE | `/api/reviews/[id]` | Delete own review | Authenticated |

### 4.11 Promos

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/promos/active` | List active promos | Public |
| POST | `/api/promos/validate` | Validate promo code | Authenticated |
| GET | `/api/admin/promos` | List all promos | Admin |
| POST | `/api/admin/promos` | Create promo | Admin |
| PUT | `/api/admin/promos/[id]` | Update promo | Admin |
| DELETE | `/api/admin/promos/[id]` | Delete promo | Admin |

### 4.12 Upload

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/upload` | Upload image (proof, avatar, court photo) | Authenticated |

### 4.13 Admin Settings

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/settings` | Get all settings | Admin |
| PUT | `/api/admin/settings` | Update settings | Admin |
| GET | `/api/admin/reports/revenue` | Revenue report | Admin |
| GET | `/api/admin/reports/occupancy` | Occupancy report | Admin |
| GET | `/api/admin/reports/members` | Member growth report | Admin |
| GET | `/api/admin/users` | List staff/admin users | Admin |
| POST | `/api/admin/users` | Create staff account | Admin |
| PUT | `/api/admin/users/[id]` | Update user role | Admin |
| DELETE | `/api/admin/users/[id]` | Deactivate user | Admin |


---

## 5. Core Business Logic

### 5.1 Booking Availability Check

```typescript
// Pseudocode for availability check
async function checkAvailability(courtId: string, date: Date, startTime: Time, endTime: Time): boolean {
  // 1. Check if court exists and is active
  // 2. Check if date is not in the past
  // 3. Check if time is within operating hours (08:00 - 00:00)
  // 4. Check for conflicting bookings (status NOT IN ['CANCELLED', 'EXPIRED'])
  // 5. Check for maintenance/blocked schedules
  // 6. Return availability status
}
```

### 5.2 Price Calculation

```typescript
function calculatePrice(courtId: string, date: Date, startTime: Time, endTime: Time): PriceBreakdown {
  // 1. Determine day_type: WEEKDAY (Mon-Fri) or WEEKEND (Sat-Sun)
  // 2. Determine time_type: REGULAR (08:00-16:00) or PRIME_TIME (16:00-00:00)
  // 3. If booking spans both time types, split and calculate separately
  // 4. Calculate: duration_hours × price_per_hour
  // 5. Apply member discount if applicable
  // 6. Apply promo code if provided
  // 7. Calculate DP amount (if payment_type = 'DP'): total × dp_percentage / 100
  // Return: { subtotal, discount, total, dp_amount }
}
```

### 5.3 Booking Flow State Machine

```
PENDING_PAYMENT → (user uploads proof) → PENDING_CONFIRMATION
PENDING_PAYMENT → (expired after 1 hour) → EXPIRED
PENDING_CONFIRMATION → (admin confirms) → CONFIRMED
PENDING_CONFIRMATION → (admin rejects) → CANCELLED
CONFIRMED → (user cancels) → CANCELLED (trigger refund logic)
CONFIRMED → (booking date passed) → COMPLETED (trigger points)
```

### 5.4 Tier Upgrade Logic

```typescript
function checkTierUpgrade(user: User): Tier | null {
  // Check after every completed booking
  if (user.tier === 'BRONZE') {
    if (user.total_bookings >= 15 || user.total_points >= 500) {
      return 'SILVER'; // Upgrade!
    }
  }
  if (user.tier === 'SILVER') {
    if (user.total_bookings >= 30 || user.total_points >= 1500) {
      return 'GOLD'; // Upgrade!
    }
  }
  return null; // No upgrade
}
```

### 5.5 Refund Calculation

```typescript
function calculateRefund(booking: Booking): RefundAmount {
  const hoursUntilBooking = diffInHours(booking.booking_date + booking.start_time, now());
  
  if (hoursUntilBooking >= 24) {
    return booking.dp_amount * 1.00; // 100% refund
  } else if (hoursUntilBooking >= 3) {
    return booking.dp_amount * 0.50; // 50% refund
  } else {
    return 0; // No refund
  }
}
```

### 5.6 Recurring Booking Generator

```typescript
// Cron job / scheduled task: runs daily at 00:01
async function generateRecurringBookings() {
  // 1. Get all active recurring_bookings
  // 2. For each, check if booking exists for next occurrence
  // 3. If not, auto-create booking (status: PENDING_PAYMENT)
  // 4. Send notification to user for payment
  // 5. If user doesn't pay within deadline, mark as expired
}
```

---

## 6. Authentication & Authorization

### 6.1 Auth Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Login     │────>│  NextAuth.js │────>│  Database   │
│  (Google/   │     │  (verify)    │     │  (session)  │
│  Credentials)     └──────────────┘     └─────────────┘
└─────────────┘            │
                           ▼
                    ┌──────────────┐
                    │   JWT Token  │
                    │  (in cookie) │
                    └──────────────┘
```

### 6.2 Role-Based Access Control (RBAC)

| Role | Access |
|------|--------|
| `USER` | Public pages, booking, own dashboard, own data |
| `STAFF` | All USER access + confirm bookings/payments, view all bookings |
| `ADMIN` | All STAFF access + CRUD locations/courts/pricing, manage users, reports, settings |

### 6.3 Middleware Protection

```typescript
// src/middleware.ts
// 1. Check locale and redirect if needed
// 2. Check auth for protected routes (/dashboard/*, /booking/*, /admin/*)
// 3. Check role for admin routes (/admin/*)
// 4. Redirect unauthorized access to login page
```

---

## 7. Notification System Design

### 7.1 Email Templates

| Template | Trigger | Variables |
|----------|---------|-----------|
| `booking-created` | New booking | userName, courtName, date, time, totalPrice, paymentDeadline |
| `payment-confirmed` | Admin confirms payment | userName, courtName, date, time, bookingId |
| `booking-reminder` | H-1 cron job | userName, courtName, date, time, locationAddress |
| `booking-cancelled` | User/admin cancels | userName, courtName, date, refundAmount |
| `refund-processed` | Admin processes refund | userName, amount, bankName, estimatedDate |
| `tier-upgrade` | User reaches tier threshold | userName, newTier, benefits |
| `welcome` | New registration | userName |
| `password-reset` | Forgot password request | userName, resetLink |

### 7.2 In-App Notification Structure

```typescript
interface Notification {
  id: string;
  userId: string;
  title: string;          // "Booking Dikonfirmasi!"
  message: string;        // "Booking Anda di Lapangan A pada 30 Mei 2026 jam 20:00 telah dikonfirmasi."
  type: 'BOOKING' | 'PAYMENT' | 'PROMO' | 'MEMBERSHIP' | 'SYSTEM';
  isRead: boolean;
  actionUrl?: string;     // "/dashboard/bookings/[id]"
  createdAt: Date;
}
```

---

## 8. Internationalization (i18n)

### 8.1 Setup

- Library: `next-intl`
- Default locale: `id` (Indonesia)
- Supported: `id`, `en`
- URL strategy: `/id/...`, `/en/...`

### 8.2 Translation File Structure

```json
// messages/id.json
{
  "common": {
    "book_now": "Book Sekarang",
    "login": "Masuk",
    "register": "Daftar",
    ...
  },
  "landing": {
    "hero_title": "Booking Lapangan Futsal Jadi Lebih Mudah",
    "hero_subtitle": "Pilih, pesan, dan main. Semudah itu.",
    ...
  },
  "booking": { ... },
  "dashboard": { ... },
  "admin": { ... }
}
```

---

## 9. Environment Variables

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=JayField

# Database
DATABASE_URL=postgresql://user:password@host:5432/jayfield

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# Email (Resend)
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@jayfield.com

# File Upload
UPLOADTHING_SECRET=sk_xxx
UPLOADTHING_APP_ID=xxx

# App Settings (overridable via admin dashboard)
DEFAULT_DP_PERCENTAGE=50
PAYMENT_DEADLINE_MINUTES=60
```

---

## 10. Security Considerations

### 10.1 Input Validation
- All API inputs validated with **Zod schemas**
- File upload: only images (jpg, png, webp), max 5MB
- Rate limiting: 100 requests/minute per IP for public, 30/minute for auth endpoints

### 10.2 Data Protection
- Passwords hashed with **bcrypt** (salt rounds: 12)
- Sensitive data (bank accounts) encrypted at rest
- SQL injection prevented by Prisma (parameterized queries)
- XSS prevented by React's default escaping + sanitization

### 10.3 Session Security
- HTTP-only cookies for JWT
- CSRF token on state-changing operations
- Session expiry: 7 days (configurable)
- Secure + SameSite cookie attributes in production

---

## 11. Performance Strategy

### 11.1 Caching
- **ISR (Incremental Static Regeneration)** for landing page, locations, courts list
- **SWR/React Query** for client-side data fetching with cache
- **Database indexes** on frequently queried columns

### 11.2 Optimization
- Image optimization via Next.js `<Image>` component
- Code splitting (dynamic imports for heavy components)
- Lazy loading for below-the-fold content
- Debounce on search inputs

### 11.3 Database Performance
- Connection pooling (Prisma + PgBouncer if needed)
- Indexes on: `bookings(court_id, booking_date)`, `notifications(user_id, is_read)`, `payments(status)`
- Pagination on all list endpoints (default: 20 items)

---

## 12. Deployment Architecture

```
┌─────────────────────────────────────────┐
│              VERCEL                       │
│  ┌─────────────────────────────────┐    │
│  │  Next.js App (Auto-scaled)      │    │
│  │  - Edge Functions (middleware)  │    │
│  │  - Serverless Functions (API)   │    │
│  │  - Static Assets (CDN)          │    │
│  └─────────────────────────────────┘    │
└─────────────────┬───────────────────────┘
                  │
    ┌─────────────▼─────────────┐
    │     Supabase / Railway     │
    │  ┌──────────────────────┐ │
    │  │   PostgreSQL DB      │ │
    │  │   (Connection Pool)  │ │
    │  └──────────────────────┘ │
    └───────────────────────────┘

    ┌───────────────────────────┐
    │   External Services        │
    │  - Resend (Email)          │
    │  - UploadThing (Files)     │
    │  - Google OAuth            │
    └───────────────────────────┘
```

### 12.1 CI/CD Pipeline

```
Push to main → Vercel auto-deploy (production)
Push to dev  → Vercel preview deployment (staging)
PR created   → Vercel preview URL for review
```

---

## 13. Scheduled Jobs (Cron)

| Job | Schedule | Description |
|-----|----------|-------------|
| Expire unpaid bookings | Every 5 minutes | Auto-cancel bookings past payment deadline |
| Booking reminders | Daily at 18:00 | Send H-1 reminders for tomorrow's bookings |
| Generate recurring bookings | Daily at 00:01 | Create next-week bookings for recurring users |
| Tier check | After each completed booking | Check and upgrade member tier |
| Cleanup expired notifications | Weekly | Remove notifications older than 90 days |

*Implementation: Vercel Cron Jobs or external service (e.g., QStash by Upstash)*

---

## 14. Error Handling Strategy

### 14.1 API Error Response Format

```typescript
interface ApiError {
  success: false;
  error: {
    code: string;        // 'BOOKING_CONFLICT', 'PAYMENT_EXPIRED', etc.
    message: string;     // Human-readable message
    details?: any;       // Additional context
  };
}

interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: {
    page: number;
    totalPages: number;
    totalItems: number;
  };
}
```

### 14.2 Common Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `AUTH_REQUIRED` | 401 | User not authenticated |
| `FORBIDDEN` | 403 | User lacks permission |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Invalid input data |
| `BOOKING_CONFLICT` | 409 | Time slot already booked |
| `PAYMENT_EXPIRED` | 410 | Payment deadline passed |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |

---

## 15. Testing Strategy

| Type | Tool | Scope |
|------|------|-------|
| Unit Test | Vitest | Utility functions, business logic |
| Integration Test | Vitest + Prisma | API endpoints, database queries |
| E2E Test | Playwright | Critical user flows (booking, payment) |
| Component Test | Vitest + Testing Library | UI components |

### Critical Test Scenarios:
1. Booking flow end-to-end (happy path)
2. Double booking prevention (concurrency)
3. Payment deadline expiration
4. Refund calculation accuracy
5. Tier upgrade trigger
6. Auth and role-based access
7. Recurring booking generation

---

*Dokumen ini menjadi acuan teknis untuk seluruh development JayField.*

**Dibuat:** 28 Mei 2026  
**Versi:** 1.0  
**Referensi:** JayField-PRD.md
