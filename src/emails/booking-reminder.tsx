import { Heading, Text } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./components/base-layout";
import { Button } from "./components/button";

type Props = {
  userName: string;
  courtName: string;
  locationName: string;
  locationAddress: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  appUrl: string;
};

/**
 * H-1 reminder, sent by daily cron job at 18:00.
 */
export function BookingReminderEmail(props: Props) {
  const {
    userName,
    courtName,
    locationName,
    locationAddress,
    bookingDate,
    startTime,
    endTime,
    appUrl,
  } = props;
  return (
    <BaseLayout preview="Reminder: jadwal main futsal kamu besok!">
      <Heading style={{ color: "#1B5E20", fontSize: "24px", margin: "0 0 16px" }}>
        ⏰ Jadwal Main Futsal Besok
      </Heading>
      <Text>Halo {userName}, jangan lupa jadwal kamu:</Text>
      <Text>
        <strong>Lapangan:</strong> {courtName}
        <br />
        <strong>Lokasi:</strong> {locationName}
        <br />
        <strong>Alamat:</strong> {locationAddress}
        <br />
        <strong>Tanggal:</strong> {bookingDate}
        <br />
        <strong>Jam:</strong> {startTime} - {endTime}
      </Text>
      <Text>Tip: datang 10 menit lebih awal untuk persiapan.</Text>
      <Text style={{ marginTop: "24px" }}>
        <Button href={`${appUrl}/dashboard/bookings`} variant="primary">
          Lihat Detail Booking
        </Button>
      </Text>
    </BaseLayout>
  );
}

export default BookingReminderEmail;
