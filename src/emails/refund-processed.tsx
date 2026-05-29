import { Heading, Text } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./components/base-layout";
import { Button } from "./components/button";

type Props = {
  userName: string;
  refundAmount: number;
  bankName: string;
  accountNumber: string;
  status: "APPROVED" | "PROCESSED" | "REJECTED";
  estimatedDate?: string;
  rejectionReason?: string;
  appUrl: string;
};

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

/**
 * Sent when a refund request changes status (APPROVED, PROCESSED, REJECTED).
 */
export function RefundProcessedEmail(props: Props) {
  const {
    userName,
    refundAmount,
    bankName,
    accountNumber,
    status,
    estimatedDate,
    rejectionReason,
    appUrl,
  } = props;

  const titleMap = {
    APPROVED: "Refund Disetujui",
    PROCESSED: "Refund Sudah Ditransfer",
    REJECTED: "Refund Ditolak",
  } as const;

  return (
    <BaseLayout preview={titleMap[status]}>
      <Heading style={{ color: "#1B5E20", fontSize: "24px", margin: "0 0 16px" }}>
        {status === "PROCESSED" ? "✅ " : ""}
        {titleMap[status]}
      </Heading>
      <Text>Halo {userName},</Text>

      {status === "APPROVED" && (
        <>
          <Text>
            Permintaan refund kamu sebesar{" "}
            <strong>{formatRupiah(refundAmount)}</strong> telah disetujui dan
            akan diproses transfer ke:
          </Text>
          <Text>
            Bank: {bankName}
            <br />Rekening: {accountNumber}
            {estimatedDate && (
              <>
                <br />Estimasi transfer: {estimatedDate}
              </>
            )}
          </Text>
        </>
      )}

      {status === "PROCESSED" && (
        <>
          <Text>
            Refund kamu sebesar <strong>{formatRupiah(refundAmount)}</strong>{" "}
            telah ditransfer ke rekening:
          </Text>
          <Text>
            Bank: {bankName}
            <br />Rekening: {accountNumber}
          </Text>
          <Text>
            Cek mutasi rekening kamu. Jika dalam 24 jam belum masuk, hubungi
            admin.
          </Text>
        </>
      )}

      {status === "REJECTED" && (
        <>
          <Text>
            Permintaan refund kamu ditolak.
            {rejectionReason && (
              <>
                <br />
                <strong>Alasan:</strong> {rejectionReason}
              </>
            )}
          </Text>
        </>
      )}

      <Text style={{ marginTop: "24px" }}>
        <Button href={`${appUrl}/dashboard/bookings`} variant="primary">
          Lihat Status Refund
        </Button>
      </Text>
    </BaseLayout>
  );
}

export default RefundProcessedEmail;
