-- CreateEnum
CREATE TYPE "RewardType" AS ENUM ('DISCOUNT_PERCENT', 'DISCOUNT_AMOUNT', 'FREE_SESSION', 'MERCHANDISE');

-- CreateTable
CREATE TABLE "rewards" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_en" TEXT,
    "description" TEXT,
    "description_en" TEXT,
    "points_cost" INTEGER NOT NULL,
    "type" "RewardType" NOT NULL,
    "value" INTEGER NOT NULL,
    "valid_for_days" INTEGER NOT NULL DEFAULT 60,
    "min_tier" "MemberTier",
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rewards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rewards_code_key" ON "rewards"("code");

-- CreateIndex
CREATE INDEX "rewards_is_active_sort_order_idx" ON "rewards"("is_active", "sort_order");

-- AlterTable: tambah kolom discount_amount untuk DISCOUNT_AMOUNT redemption type.
ALTER TABLE "redemptions" ADD COLUMN "discount_amount" INTEGER;

-- Seed: existing 4 hardcoded rewards (preserve `key` from lib/rewards.ts).
-- Pakai gen_random_uuid() casted ke text agar id tidak hardcoded; bisa diganti pakai cuid via app
-- tapi untuk migration ini bisa apa adanya. Ambil bentuk uuid pendek.
INSERT INTO "rewards" ("id", "code", "name", "name_en", "description", "description_en", "points_cost", "type", "value", "valid_for_days", "min_tier", "is_active", "sort_order", "created_at", "updated_at")
VALUES
  (
    'rwd_seed_discount_10',
    'discount_10',
    'Diskon 10% (1x booking)',
    '10% discount (1x booking)',
    'Potongan 10% di booking berikutnya',
    '10% off your next booking',
    100,
    'DISCOUNT_PERCENT',
    10,
    60,
    NULL,
    true,
    10,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'rwd_seed_discount_25',
    'discount_25',
    'Diskon 25% (1x booking)',
    '25% discount (1x booking)',
    'Potongan 25% di booking berikutnya',
    '25% off your next booking',
    200,
    'DISCOUNT_PERCENT',
    25,
    60,
    NULL,
    true,
    20,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'rwd_seed_free_session',
    'free_session',
    'Free 1 sesi (1 jam)',
    'Free 1 session (1 hour)',
    'Free 1 jam booking lapangan reguler',
    '1 hour free regular court booking',
    500,
    'FREE_SESSION',
    1,
    60,
    NULL,
    true,
    30,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'rwd_seed_merchandise',
    'merchandise',
    'Merchandise JayField',
    'JayField Merchandise',
    'Tukar dengan merchandise (jersey/totebag), ambil di lokasi.',
    'Redeem for merchandise (jersey/tote), pickup on-site.',
    300,
    'MERCHANDISE',
    1,
    30,
    NULL,
    true,
    40,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("code") DO NOTHING;
