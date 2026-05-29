import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { AppSettingsForm } from "@/components/admin/AppSettingsForm";
import { PaymentMethodsManager } from "@/components/admin/PaymentMethodsManager";
import type { AppSettingsInput } from "@/lib/validations/settings";

export const dynamic = "force-dynamic";

const DEFAULTS: AppSettingsInput = {
  dp_percentage: 50,
  payment_deadline_minutes: 60,
  refund_policy_h1: 100,
  refund_policy_same_day_3h: 50,
  refund_policy_less_3h: 0,
  points_per_hour: 10,
  points_review: 5,
  points_referral: 20,
  points_bonus_off_peak: 5,
};

export default async function AdminSettingsPage({
  params,
}: {
  params: { locale: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);
  if (session.role !== "ADMIN") {
    redirect(`/${params.locale}/dashboard`);
  }

  const [settingsRows, paymentMethods] = await Promise.all([
    prisma.appSetting.findMany(),
    prisma.paymentMethod.findMany({
      orderBy: [{ isActive: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  const settingsMap = new Map(settingsRows.map((r) => [r.key, r.value]));
  const settings: AppSettingsInput = { ...DEFAULTS };
  for (const key of Object.keys(DEFAULTS) as Array<keyof AppSettingsInput>) {
    const raw = settingsMap.get(key);
    if (raw !== undefined) {
      const num = Number(raw);
      if (!Number.isNaN(num)) settings[key] = num;
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-text-primary mb-2">
          Pengaturan
        </h1>
        <p className="text-sm text-text-secondary">
          Konfigurasi aplikasi & metode pembayaran
        </p>
      </div>

      <AppSettingsForm initial={settings} />

      <PaymentMethodsManager initial={paymentMethods} />
    </div>
  );
}
