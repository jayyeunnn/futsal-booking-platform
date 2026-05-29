export const APP_NAME = "JayField";
export const APP_DESCRIPTION = "Booking lapangan futsal jadi lebih mudah. Pilih, pesan, dan main. Semudah itu.";

export const LOCALES = ["id", "en"] as const;
export const DEFAULT_LOCALE = "id";

export const OPERATING_HOURS = {
  open: "08:00",
  close: "00:00",
};

export const PAYMENT_DEADLINE_MINUTES = 60;
export const DEFAULT_DP_PERCENTAGE = 50;

export const TIER_THRESHOLDS = {
  silver: { bookings: 15, points: 500 },
  gold: { bookings: 30, points: 1500 },
};

export const POINTS = {
  perHour: 10,
  review: 5,
  referral: 20,
  offPeakBonus: 5,
};
