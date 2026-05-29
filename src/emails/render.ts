import { render } from "@react-email/components";
import * as React from "react";
import { sendEmail } from "@/lib/email";
import { WelcomeEmail } from "./welcome";
import { PasswordResetEmail } from "./password-reset";
import { BookingConfirmedEmail } from "./booking-confirmed";
import { BookingReminderEmail } from "./booking-reminder";
import { TierUpgradeEmail } from "./tier-upgrade";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Convenience wrappers around React Email + Resend send.
 * Each function renders the JSX template to HTML and dispatches via Resend.
 * Returns the raw sendEmail result so callers can choose to log/ignore.
 */

export async function sendWelcomeEmail(to: string, userName: string) {
  const html = await render(
    React.createElement(WelcomeEmail, { userName, appUrl: APP_URL })
  );
  return sendEmail({
    to,
    subject: `Selamat datang di JayField, ${userName}!`,
    html,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  userName: string,
  resetUrl: string,
  expiresInMinutes = 60
) {
  const html = await render(
    React.createElement(PasswordResetEmail, {
      userName,
      resetUrl,
      expiresInMinutes,
    })
  );
  return sendEmail({ to, subject: "Reset Password JayField", html });
}

export async function sendBookingConfirmedEmail(
  to: string,
  data: {
    userName: string;
    bookingId: string;
    courtName: string;
    locationName: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
  }
) {
  const html = await render(
    React.createElement(BookingConfirmedEmail, { ...data, appUrl: APP_URL })
  );
  return sendEmail({ to, subject: "✅ Booking Dikonfirmasi", html });
}

export async function sendBookingReminderEmail(
  to: string,
  data: {
    userName: string;
    courtName: string;
    locationName: string;
    locationAddress: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
  }
) {
  const html = await render(
    React.createElement(BookingReminderEmail, { ...data, appUrl: APP_URL })
  );
  return sendEmail({
    to,
    subject: `⏰ Reminder: Main futsal besok di ${data.courtName}`,
    html,
  });
}

export async function sendTierUpgradeEmail(
  to: string,
  userName: string,
  newTier: "SILVER" | "GOLD"
) {
  const html = await render(
    React.createElement(TierUpgradeEmail, {
      userName,
      newTier,
      appUrl: APP_URL,
    })
  );
  return sendEmail({
    to,
    subject: `🎉 Selamat! Kamu naik ke tier ${newTier}`,
    html,
  });
}


import { BookingCreatedEmail } from "./booking-created";
import { BookingCancelledEmail } from "./booking-cancelled";
import { RefundProcessedEmail } from "./refund-processed";

export async function sendBookingCreatedEmail(
  to: string,
  data: {
    userName: string;
    bookingId: string;
    courtName: string;
    locationName: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    paymentType: "DP" | "FULL";
    payableAmount: number;
    paymentDeadline: string;
  }
) {
  const html = await render(
    React.createElement(BookingCreatedEmail, { ...data, appUrl: APP_URL })
  );
  return sendEmail({
    to,
    subject: "📋 Booking dibuat — selesaikan pembayaran",
    html,
  });
}

export async function sendBookingCancelledEmail(
  to: string,
  data: {
    userName: string;
    courtName: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    reason?: string;
    refundEligible: boolean;
    refundAmount?: number;
  }
) {
  const html = await render(
    React.createElement(BookingCancelledEmail, { ...data, appUrl: APP_URL })
  );
  return sendEmail({ to, subject: "Booking Dibatalkan", html });
}

export async function sendRefundProcessedEmail(
  to: string,
  data: {
    userName: string;
    refundAmount: number;
    bankName: string;
    accountNumber: string;
    status: "APPROVED" | "PROCESSED" | "REJECTED";
    estimatedDate?: string;
    rejectionReason?: string;
  }
) {
  const html = await render(
    React.createElement(RefundProcessedEmail, { ...data, appUrl: APP_URL })
  );
  const subjectMap = {
    APPROVED: "Refund Disetujui",
    PROCESSED: "✅ Refund Sudah Ditransfer",
    REJECTED: "Refund Ditolak",
  } as const;
  return sendEmail({ to, subject: subjectMap[data.status], html });
}
