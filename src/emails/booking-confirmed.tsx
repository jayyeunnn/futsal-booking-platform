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
  appUrl: string;
};

/**
 * Sent when admin confirms a payment (booking → CONFIRMED).
 */
export function BookingConfirmedEmail(props: Props) {
  const {
    userName,
    bookingId,
    courtName,
    locationName,
    bookingDate,
    startTime,
    endTime,
    appUrl,
  } = props;
  return (
    <BaseLayout preview="Booking dikonfirmasi!">
      <Heading style={{ color: "#1B5E20", fontSize: "24px", margin: "0 0 16px" }}>
        ✅ Booking Dikonfirmasi
      </Heading>
      <Text>Halo {userName},</Text>
      <Text>
        Pembayaran kamu sudah kami terima dan booking sudah dikonfirmasi.
      </Text>
      <Text>
        <strong>Detail:</strong>
        <br />Lapangan: {courtName}
        <br />Lokasi: {locationName}
        <br />Tanggal: {bookingDate}
        <br />Jam: {startTime} - {endTime}
        <br />ID Booking: {bookingId}
      </Text>
      <Text style={{ marginTop: "24px" }}>
        <Button href={`${appUrl}/dashboard/bookings`} variant="primary">
          Lihat Booking Saya
        </Button>
      </Text>
    </BaseLayout>
  );
}

export default BookingConfirmedEmail;
