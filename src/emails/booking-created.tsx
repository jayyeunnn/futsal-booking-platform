import { Heading, Text } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./components/base-layout";
import { Button } from "./components/button";

type Props = {
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
  appUrl: string;
};

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

/**
 * Sent immediately after a booking is created (status: PENDING_PAYMENT).
 * Includes payment instructions and the 1-hour deadline.
 */
export function BookingCreatedEmail(props: Props) {
  const {
    userName,
    bookingId,
    courtName,
    locationName,
    bookingDate,
    startTime,
    endTime,
    paymentType,
    payableAmount,
    paymentDeadline,
    appUrl,
  } = props;
  return (
    <BaseLayout preview="Booking dibuat — selesaikan pembayaran dalam 1 jam">
      <Heading style={{ color: "#1B5E20", fontSize: "24px", margin: "0 0 16px" }}>
        📋 Booking Dibuat
      </Heading>
      <Text>Halo {userName},</Text>
      <Text>
        Booking kamu sudah dibuat. Selesaikan pembayaran dalam{" "}
        <strong>1 jam</strong> agar slot tidak hangus.
      </Text>
      <Text>
        <strong>Detail booking:</strong>
        <br />Lapangan: {courtName}
        <br />Lokasi: {locationName}
        <br />Tanggal: {bookingDate}
        <br />Jam: {startTime} - {endTime}
        <br />ID Booking: {bookingId}
      </Text>
      <Text>
        <strong>Pembayaran:</strong>
        <br />Tipe: {paymentType === "DP" ? "DP (50%)" : "Bayar Full"}
        <br />Jumlah: {formatRupiah(payableAmount)}
        <br />Batas waktu: {paymentDeadline}
      </Text>
      <Text style={{ marginTop: "24px" }}>
        <Button href={`${appUrl}/dashboard/bookings`} variant="cta">
          Bayar Sekarang
        </Button>
      </Text>
      <Text style={{ color: "#616161", fontSize: "13px", marginTop: "24px" }}>
        Setelah transfer, upload bukti pembayaran via dashboard untuk
        konfirmasi admin.
      </Text>
    </BaseLayout>
  );
}

export default BookingCreatedEmail;
