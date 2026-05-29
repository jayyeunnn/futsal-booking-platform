/**
 * Shared FAQ source — dipakai di landing FAQSection dan halaman /faq.
 * Disimpan di sini supaya kedua tempat selalu sinkron.
 */
export type FaqItem = {
  question: string;
  answer: string;
  category?: string;
};

export const FAQS: FaqItem[] = [
  {
    category: "Booking",
    question: "Bagaimana cara booking lapangan?",
    answer:
      "Pilih lokasi dan lapangan, pilih tanggal & jam yang tersedia, lalu konfirmasi booking. Kamu bisa memilih bayar DP (50%) atau bayar full. Setelah itu, upload bukti transfer dan tunggu konfirmasi admin.",
  },
  {
    category: "Booking",
    question: "Berapa lama booking saya berlaku sebelum hangus?",
    answer:
      "Setelah booking dibuat, kamu punya waktu 1 jam untuk upload bukti transfer. Setelah lewat, booking akan otomatis dibatalkan dan slot kembali tersedia.",
  },
  {
    category: "Pembayaran",
    question: "Berapa DP yang harus dibayar?",
    answer:
      "DP sebesar 50% dari total harga booking. Kamu juga bisa memilih bayar full (100%) agar tidak perlu bayar sisa di tempat.",
  },
  {
    category: "Pembayaran",
    question: "Metode pembayaran apa saja yang tersedia?",
    answer:
      "Kami menerima transfer bank (BCA, BNI, Mandiri, BRI) dan e-wallet (Dana, OVO, GoPay). Cukup pilih metode, transfer, dan upload bukti pembayaran.",
  },
  {
    category: "Pembatalan",
    question: "Bisakah membatalkan booking?",
    answer:
      "Ya, kamu bisa membatalkan booking. Refund: H-1 (>24 jam) mendapat refund 100% DP, hari H (>3 jam sebelum) refund 50%, dan kurang dari 3 jam sebelum jadwal tidak ada refund.",
  },
  {
    category: "Pembatalan",
    question: "Berapa lama proses refund?",
    answer:
      "Setelah pembatalan disetujui, refund akan diproses transfer ke rekening kamu dalam 1-3 hari kerja.",
  },
  {
    category: "Membership",
    question: "Apa keuntungan jadi member?",
    answer:
      "Member otomatis didapat saat registrasi (gratis). Kumpulkan poin dari setiap booking untuk naik tier (Bronze → Silver → Gold). Benefit termasuk diskon hingga 20%, priority booking di jam prime-time, dan free extra time.",
  },
  {
    category: "Membership",
    question: "Bagaimana cara naik tier?",
    answer:
      "Bronze → Silver: cukup 15 booking ATAU 500 poin. Silver → Gold: 30 booking ATAU 1500 poin. Cukup salah satu syarat saja terpenuhi.",
  },
  {
    category: "Operasional",
    question: "Jam operasional lapangan?",
    answer:
      "Semua lokasi JayField beroperasi setiap hari dari jam 08:00 pagi hingga 00:00 (tengah malam). Durasi booking bersifat fleksibel, mulai dari 1 jam.",
  },
  {
    category: "Operasional",
    question: "Apakah ada loker/ruang ganti?",
    answer:
      "Ya, semua lokasi punya ruang ganti dan toilet. Beberapa lokasi juga dilengkapi shower, mushola, dan kantin. Cek detail fasilitas di halaman lokasi.",
  },
];
