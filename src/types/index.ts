export type Locale = "id" | "en";

export type UserRole = "USER" | "STAFF" | "ADMIN";

export type MemberTier = "BRONZE" | "SILVER" | "GOLD";

export type CourtType = "INDOOR" | "OUTDOOR";

export type DayType = "WEEKDAY" | "WEEKEND";

export type TimeType = "REGULAR" | "PRIME_TIME";

export type BookingStatus =
  | "PENDING_PAYMENT"
  | "PENDING_CONFIRMATION"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";

export type PaymentType = "DP" | "FULL" | "SETTLEMENT";

export type PaymentStatus =
  | "PENDING"
  | "UPLOADED"
  | "CONFIRMED"
  | "REJECTED"
  | "EXPIRED";

export type RefundStatus =
  | "REQUESTED"
  | "APPROVED"
  | "REJECTED"
  | "PROCESSED";

export type NotificationType =
  | "BOOKING"
  | "PAYMENT"
  | "PROMO"
  | "MEMBERSHIP"
  | "SYSTEM";

export type PointsType =
  | "EARNED_BOOKING"
  | "EARNED_REVIEW"
  | "EARNED_REFERRAL"
  | "EARNED_BONUS"
  | "REDEEMED_DISCOUNT"
  | "REDEEMED_FREE_SESSION"
  | "REDEEMED_MERCHANDISE"
  | "ADMIN_ADJUST";
