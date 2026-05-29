-- Add referral fields to users table
ALTER TABLE "users"
  ADD COLUMN     "referral_code" TEXT,
  ADD COLUMN     "referred_by_id" TEXT;

-- Unique index for referral_code (NULLs allowed, so unique is safe)
CREATE UNIQUE INDEX "users_referral_code_key" ON "users"("referral_code");

-- Self-referencing FK: referee.referred_by_id -> referrer.id
ALTER TABLE "users"
  ADD CONSTRAINT "users_referred_by_id_fkey"
  FOREIGN KEY ("referred_by_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
