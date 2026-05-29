"use client";

import { useState } from "react";
import Link from "next/link";
import { CancelBookingDialog } from "./CancelBookingDialog";
import { Button } from "@/components/ui/button";

type RefundPreview = {
  eligible: boolean;
  percentage: number;
  amount: number;
  reason: string;
};

type Props = {
  bookingId: string;
  status: string;
  locale: string;
  refundPreview: RefundPreview | null;
};

/**
 * Action bar shown on the booking detail page. Picks the correct CTAs
 * for the booking's current status.
 */
export function BookingActions({
  bookingId,
  status,
  locale,
  refundPreview,
}: Props) {
  const [cancelOpen, setCancelOpen] = useState(false);

  const cancellable = ["PENDING_PAYMENT", "PENDING_CONFIRMATION", "CONFIRMED"];
  const showCancel = cancellable.includes(status);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2">
        {status === "PENDING_PAYMENT" && (
          <Link
            href={`/${locale}/booking/confirm?bookingId=${bookingId}`}
            className="flex-1 h-10 rounded-lg bg-cta hover:bg-cta-hover text-white text-sm font-semibold flex items-center justify-center"
          >
            Bayar Sekarang
          </Link>
        )}
        {showCancel && (
          <Button
            variant="destructive"
            className="h-10"
            onClick={() => setCancelOpen(true)}
          >
            Batalkan Booking
          </Button>
        )}
      </div>

      <CancelBookingDialog
        bookingId={bookingId}
        status={status}
        refundPreview={refundPreview}
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
      />
    </>
  );
}
