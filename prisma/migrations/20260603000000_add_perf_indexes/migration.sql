-- Performance indexes (Section 3.6 — task 3.6)
--
-- Why CREATE INDEX IF NOT EXISTS instead of `prisma migrate dev` defaults?
-- Supabase production runs without migrate-deploy in some setups; using
-- IF NOT EXISTS keeps this migration safe to re-run and works whether
-- the index was already created via `prisma db push` or by hand.
--
-- All indexes are non-blocking on Supabase Postgres (B-tree by default).
-- These cover the hottest query paths identified during the perf audit:
--   - User filters (role + isActive, tier)
--   - Booking listing & status reports
--   - Payment lifecycle queries
--   - Refund admin queue
--   - Points history pagination
--   - Review visibility & per-court rating aggregation
--   - Promo active-window scan

-- ============ User ============
CREATE INDEX IF NOT EXISTS "users_role_is_active_idx"
  ON "users"("role", "is_active");

CREATE INDEX IF NOT EXISTS "users_tier_idx"
  ON "users"("tier");

-- ============ Booking ============
-- (court_id, booking_date, status) and (user_id, status) already exist.
CREATE INDEX IF NOT EXISTS "bookings_status_booking_date_idx"
  ON "bookings"("status", "booking_date");

-- ============ Payment ============
CREATE INDEX IF NOT EXISTS "payments_booking_id_idx"
  ON "payments"("booking_id");

CREATE INDEX IF NOT EXISTS "payments_status_created_at_idx"
  ON "payments"("status", "created_at");

-- ============ Refund ============
CREATE INDEX IF NOT EXISTS "refunds_user_id_status_idx"
  ON "refunds"("user_id", "status");

CREATE INDEX IF NOT EXISTS "refunds_status_created_at_idx"
  ON "refunds"("status", "created_at");

-- ============ Points History ============
CREATE INDEX IF NOT EXISTS "points_history_user_id_type_idx"
  ON "points_history"("user_id", "type");

CREATE INDEX IF NOT EXISTS "points_history_user_id_created_at_idx"
  ON "points_history"("user_id", "created_at");

-- ============ Review ============
CREATE INDEX IF NOT EXISTS "reviews_court_id_is_visible_idx"
  ON "reviews"("court_id", "is_visible");

CREATE INDEX IF NOT EXISTS "reviews_user_id_idx"
  ON "reviews"("user_id");

-- ============ Promo ============
CREATE INDEX IF NOT EXISTS "promos_is_active_end_date_idx"
  ON "promos"("is_active", "end_date");
