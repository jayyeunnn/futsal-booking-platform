import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Seed script untuk JayField — data dummy lengkap untuk testing Phase 1 + 2.
 *
 * Idempotent — pakai upsert dimana mungkin, jadi aman re-run berkali-kali.
 *
 * Yang dibuat:
 *   - 1 admin user + 1 staff user + 1 regular user
 *   - 2 lokasi (Sudirman + Gatsu)
 *   - 5 court (3 indoor + 2 outdoor)
 *   - Pricing lengkap (4 kombinasi DayType × TimeType per court)
 *   - 4 payment methods (BCA, BNI, GoPay, OVO)
 *   - 2 promo aktif
 *   - App settings default
 */
async function main() {
  console.log("🌱 Mulai seed JayField...\n");

  // ---------- USERS ----------
  const adminPassword = await bcrypt.hash("admin123", 12);
  const staffPassword = await bcrypt.hash("staff123", 12);
  const userPassword = await bcrypt.hash("user123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@jayfield.com" },
    update: {},
    create: {
      email: "admin@jayfield.com",
      name: "Admin JayField",
      passwordHash: adminPassword,
      phone: "081234567890",
      role: "ADMIN",
      tier: "GOLD",
      provider: "credentials",
      isActive: true,
    },
  });
  console.log("✓ Admin user:", admin.email, "(password: admin123)");

  const staff = await prisma.user.upsert({
    where: { email: "staff@jayfield.com" },
    update: {},
    create: {
      email: "staff@jayfield.com",
      name: "Staff JayField",
      passwordHash: staffPassword,
      phone: "081234567891",
      role: "STAFF",
      tier: "BRONZE",
      provider: "credentials",
      isActive: true,
    },
  });
  console.log("✓ Staff user:", staff.email, "(password: staff123)");

  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      name: "John Doe",
      passwordHash: userPassword,
      phone: "081234567892",
      role: "USER",
      tier: "BRONZE",
      provider: "credentials",
      isActive: true,
    },
  });
  console.log("✓ Regular user:", user.email, "(password: user123)");

  // ---------- LOCATIONS ----------
  const locA = await prisma.location.upsert({
    where: { id: "loc-sudirman" },
    update: {},
    create: {
      id: "loc-sudirman",
      name: "JayField Sudirman",
      address: "Jl. Jenderal Sudirman No. 10",
      city: "Jakarta Selatan",
      phone: "021-1234567",
      email: "sudirman@jayfield.com",
      openTime: "08:00",
      closeTime: "00:00",
      description: "Lokasi utama JayField di Sudirman dengan 3 lapangan terbaik",
      isActive: true,
    },
  });
  console.log("✓ Location:", locA.name);

  const locB = await prisma.location.upsert({
    where: { id: "loc-gatsu" },
    update: {},
    create: {
      id: "loc-gatsu",
      name: "JayField Gatot Subroto",
      address: "Jl. Gatot Subroto No. 22",
      city: "Jakarta Pusat",
      phone: "021-9876543",
      email: "gatsu@jayfield.com",
      openTime: "08:00",
      closeTime: "00:00",
      description: "Lokasi kedua JayField, dekat MRT Setiabudi",
      isActive: true,
    },
  });
  console.log("✓ Location:", locB.name);

  // ---------- COURTS ----------
  const courts = [
    {
      id: "court-1",
      locationId: locA.id,
      name: "Lapangan 1",
      type: "INDOOR" as const,
      surface: "vinyl",
      facilities: ["AC", "Lampu LED", "Sound system", "Toilet"],
    },
    {
      id: "court-2",
      locationId: locA.id,
      name: "Lapangan 2",
      type: "INDOOR" as const,
      surface: "synthetic_grass",
      facilities: ["AC", "Lampu LED", "Toilet"],
    },
    {
      id: "court-3",
      locationId: locA.id,
      name: "Lapangan 3",
      type: "OUTDOOR" as const,
      surface: "synthetic_grass",
      facilities: ["Lampu LED", "Toilet", "Tribun"],
    },
    {
      id: "court-4",
      locationId: locB.id,
      name: "Lapangan A",
      type: "INDOOR" as const,
      surface: "vinyl",
      facilities: ["AC", "Lampu LED", "Toilet", "Mushola"],
    },
    {
      id: "court-5",
      locationId: locB.id,
      name: "Lapangan B",
      type: "OUTDOOR" as const,
      surface: "synthetic_grass",
      facilities: ["Lampu LED", "Toilet", "Mushola", "Kantin"],
    },
  ];

  for (const c of courts) {
    await prisma.court.upsert({
      where: { id: c.id },
      update: {},
      create: {
        ...c,
        capacity: 10,
        photos: [],
        isActive: true,
      },
    });
    console.log(`✓ Court: ${c.name} (${c.type})`);
  }

  // ---------- PRICING ----------
  // Indoor: weekday regular 150k, weekday prime 250k, weekend regular 175k, weekend prime 275k
  // Outdoor: weekday regular 120k, weekday prime 200k, weekend regular 140k, weekend prime 220k
  const pricingData = [
    // Indoor courts (1, 2, 4)
    { courtIds: ["court-1", "court-2", "court-4"], dayType: "WEEKDAY" as const, timeType: "REGULAR" as const, startHour: "08:00", endHour: "16:00", price: 150000 },
    { courtIds: ["court-1", "court-2", "court-4"], dayType: "WEEKDAY" as const, timeType: "PRIME_TIME" as const, startHour: "16:00", endHour: "00:00", price: 250000 },
    { courtIds: ["court-1", "court-2", "court-4"], dayType: "WEEKEND" as const, timeType: "REGULAR" as const, startHour: "08:00", endHour: "16:00", price: 175000 },
    { courtIds: ["court-1", "court-2", "court-4"], dayType: "WEEKEND" as const, timeType: "PRIME_TIME" as const, startHour: "16:00", endHour: "00:00", price: 275000 },
    // Outdoor courts (3, 5)
    { courtIds: ["court-3", "court-5"], dayType: "WEEKDAY" as const, timeType: "REGULAR" as const, startHour: "08:00", endHour: "16:00", price: 120000 },
    { courtIds: ["court-3", "court-5"], dayType: "WEEKDAY" as const, timeType: "PRIME_TIME" as const, startHour: "16:00", endHour: "00:00", price: 200000 },
    { courtIds: ["court-3", "court-5"], dayType: "WEEKEND" as const, timeType: "REGULAR" as const, startHour: "08:00", endHour: "16:00", price: 140000 },
    { courtIds: ["court-3", "court-5"], dayType: "WEEKEND" as const, timeType: "PRIME_TIME" as const, startHour: "16:00", endHour: "00:00", price: 220000 },
  ];

  // Reset all existing pricing then re-insert (idempotent without complex compound key).
  await prisma.pricing.deleteMany({});
  for (const row of pricingData) {
    for (const courtId of row.courtIds) {
      await prisma.pricing.create({
        data: {
          courtId,
          dayType: row.dayType,
          timeType: row.timeType,
          startHour: row.startHour,
          endHour: row.endHour,
          pricePerHour: row.price,
          isActive: true,
        },
      });
    }
  }
  console.log(`✓ Pricing: ${pricingData.length * 3 + pricingData.length * 2} rows`);

  // ---------- PAYMENT METHODS ----------
  const paymentMethods = [
    { name: "BCA", type: "BANK_TRANSFER" as const, accountNumber: "1234567890", accountHolder: "PT JayField Indonesia", sortOrder: 1 },
    { name: "BNI", type: "BANK_TRANSFER" as const, accountNumber: "0987654321", accountHolder: "PT JayField Indonesia", sortOrder: 2 },
    { name: "Mandiri", type: "BANK_TRANSFER" as const, accountNumber: "1122334455", accountHolder: "PT JayField Indonesia", sortOrder: 3 },
    { name: "GoPay", type: "E_WALLET" as const, accountNumber: "081234567890", accountHolder: "JayField", sortOrder: 4 },
    { name: "OVO", type: "E_WALLET" as const, accountNumber: "081234567890", accountHolder: "JayField", sortOrder: 5 },
  ];

  await prisma.paymentMethod.deleteMany({});
  for (const pm of paymentMethods) {
    await prisma.paymentMethod.create({ data: { ...pm, isActive: true } });
  }
  console.log(`✓ Payment methods: ${paymentMethods.length} entries`);

  // ---------- PROMOS ----------
  const now = new Date();
  const oneMonthFromNow = new Date(now);
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

  await prisma.promo.upsert({
    where: { code: "JAYFIELD10" },
    update: {},
    create: {
      code: "JAYFIELD10",
      title: "Diskon 10%",
      description: "Diskon 10% untuk semua booking",
      discountType: "PERCENTAGE",
      discountValue: 10,
      maxDiscount: 50000,
      perUserLimit: 3,
      memberOnly: false,
      startDate: now,
      endDate: oneMonthFromNow,
      isActive: true,
    },
  });
  console.log("✓ Promo: JAYFIELD10");

  await prisma.promo.upsert({
    where: { code: "MEMBERSILVER" },
    update: {},
    create: {
      code: "MEMBERSILVER",
      title: "Promo Member Silver",
      description: "Diskon 20rb khusus member Silver+",
      discountType: "FIXED_AMOUNT",
      discountValue: 20000,
      memberOnly: true,
      minTier: "SILVER",
      perUserLimit: 5,
      startDate: now,
      endDate: oneMonthFromNow,
      isActive: true,
    },
  });
  console.log("✓ Promo: MEMBERSILVER");

  // ---------- REWARDS ----------
  // Default reward catalog. `code` di-persist di Redemption.rewardKey, jadi
  // jangan rename setelah ada data — bikin entry baru kalau perlu.
  const rewards = [
    {
      code: "discount_10",
      name: "Diskon 10% (1x booking)",
      nameEn: "10% discount (1x booking)",
      description: "Potongan 10% di booking berikutnya",
      descriptionEn: "10% off your next booking",
      pointsCost: 100,
      type: "DISCOUNT_PERCENT" as const,
      value: 10,
      validForDays: 60,
      sortOrder: 10,
    },
    {
      code: "discount_25",
      name: "Diskon 25% (1x booking)",
      nameEn: "25% discount (1x booking)",
      description: "Potongan 25% di booking berikutnya",
      descriptionEn: "25% off your next booking",
      pointsCost: 200,
      type: "DISCOUNT_PERCENT" as const,
      value: 25,
      validForDays: 60,
      sortOrder: 20,
    },
    {
      code: "free_session",
      name: "Free 1 sesi (1 jam)",
      nameEn: "Free 1 session (1 hour)",
      description: "Free 1 jam booking lapangan reguler",
      descriptionEn: "1 hour free regular court booking",
      pointsCost: 500,
      type: "FREE_SESSION" as const,
      value: 1,
      validForDays: 60,
      sortOrder: 30,
    },
    {
      code: "merchandise",
      name: "Merchandise JayField",
      nameEn: "JayField Merchandise",
      description: "Tukar dengan merchandise (jersey/totebag), ambil di lokasi.",
      descriptionEn: "Redeem for merchandise (jersey/tote), pickup on-site.",
      pointsCost: 300,
      type: "MERCHANDISE" as const,
      value: 1,
      validForDays: 30,
      sortOrder: 40,
    },
  ];
  for (const r of rewards) {
    await prisma.reward.upsert({
      where: { code: r.code },
      update: {},
      create: { ...r, isActive: true },
    });
  }
  console.log(`✓ Rewards: ${rewards.length} entries`);

  // ---------- APP SETTINGS ----------
  const settings = [
    { key: "dp_percentage", value: "50", description: "Persentase DP dari total booking" },
    { key: "payment_deadline_minutes", value: "60", description: "Batas waktu upload bukti pembayaran (menit)" },
    { key: "refund_policy_h1", value: "100", description: "Persentase refund untuk pembatalan H-1" },
    { key: "refund_policy_same_day_3h", value: "50", description: "Persentase refund untuk pembatalan hari H >3 jam" },
    { key: "refund_policy_less_3h", value: "0", description: "Persentase refund untuk pembatalan <3 jam" },
    { key: "points_per_hour", value: "10", description: "Poin yang didapat per jam booking" },
    { key: "points_review", value: "5", description: "Poin untuk submit review" },
    { key: "points_referral", value: "20", description: "Poin untuk referral" },
    { key: "points_bonus_off_peak", value: "5", description: "Bonus poin untuk booking di jam sepi (08:00-16:00)" },
  ];

  for (const s of settings) {
    await prisma.appSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, description: s.description },
      create: s,
    });
  }
  console.log(`✓ App settings: ${settings.length} entries`);

  console.log("\n🎉 Seed selesai!\n");
  console.log("===== CREDENTIALS =====");
  console.log("Admin: admin@jayfield.com / admin123");
  console.log("Staff: staff@jayfield.com / staff123");
  console.log("User:  user@example.com / user123");
  console.log("\n===== PROMO CODES =====");
  console.log("JAYFIELD10   - Diskon 10% (max Rp 50rb)");
  console.log("MEMBERSILVER - Diskon Rp 20rb (Silver+ only)");
  console.log("\n===== TEST PERINTAH =====");
  console.log("npm run dev");
  console.log("Buka: http://localhost:3000/id");
}

main()
  .catch((e) => {
    console.error("❌ Seed gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
