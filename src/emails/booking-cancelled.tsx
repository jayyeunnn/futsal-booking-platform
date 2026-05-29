import { Heading, Text } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./components/base-layout";
import { Button } from "./components/button";

type Props = {
  userName: string;
  courtName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  reason?: string;
  refundEligible: boolean;
  refundAmount?: number;
  appUrl: string;
};

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

/**
 * Sent when a booking is cancelled (by user or admin).
 * Includes refund eligibility info per PRD §3.3.4.
 */
export function BookingCancelledEmail(props: Props) {
  const {
    userName,
    courtName,
    bookingDate,
    startTime,
    endTime,
    reason,
    refundEligible,
    refundAmount,
    appUrl,
  } = props;
  return (
    <BaseLayout preview="Booking kamu dibatalkan">
      <Heading style={{ color: "#1B5E20", fontSize: "24px", margin: "0 0 16px" }}>
        Booking Dibatalkan
      </Heading>
      <Text>Halo {userName},</Text>
      <Text>
        Booking kamu di <strong>{courtName}</strong> pada {bookingDate} jam{" "}
        {startTime} - {endTime} telah dibatalkan.
      </Text>
      {reason && (
        <Text>
          <strong>Alasan:</strong> {reason}
        </Text>
      )}
      {refundEligible && refundAmount !== undefined ? (
        <Text>
          <strong>Refund:</strong> {formatRupiah(refundAmount)} akan ditransfer
          balik ke rekening kamu (1-3 hari kerja). Submit detail rekening lewat
          dashboard refund.
        </Text>
      ) : (
        <Text>
          Sesuai kebijakan refund, pembatalan ini tidak memenuhi syarat untuk
          pengembalian dana. Cek FAQ untuk detail kebijakan.
        </Text>
      )}
      <Text style={{ marginTop: "24px" }}>
        <Button href={`${appUrl}/dashboard/bookings`} variant="primary">
          Lihat Detail di Dashboard
        </Button>
      </Text>
    </BaseLayout>
  );
}

export default BookingCancelledEmail;
