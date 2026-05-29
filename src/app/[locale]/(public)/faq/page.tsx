import type { Metadata } from "next";
import { FAQS } from "@/lib/faq-data";
import { FAQAccordion } from "@/components/public/FAQAccordion";
import { buildMetadata } from "@/lib/seo";

// FAQ rarely changes — cache aggressively (1 hour).
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return buildMetadata({
    locale: params.locale,
    path: "/faq",
    titleId: "FAQ — Pertanyaan Umum JayField",
    titleEn: "FAQ — JayField Frequently Asked Questions",
    descriptionId:
      "Pertanyaan umum seputar booking, pembayaran, member, dan kebijakan JayField.",
    descriptionEn:
      "Common questions about booking, payments, membership, and JayField policies.",
  });
}

export default function FAQPage() {
  // Group FAQs by category for cleaner organization on a dedicated page.
  const grouped = FAQS.reduce<Record<string, typeof FAQS>>((acc, item) => {
    const cat = item.category ?? "Umum";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="bg-muted">
      <section className="bg-gradient-to-br from-primary to-primary-light text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-4">
            Pertanyaan Umum
          </h1>
          <p className="text-lg text-white/85">
            Jawaban atas pertanyaan yang paling sering ditanyakan
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-xl font-heading font-bold text-text-primary mb-4">
              {category}
            </h2>
            <FAQAccordion items={items} />
          </div>
        ))}

        <div className="bg-surface border border-border rounded-xl p-6 text-center">
          <h3 className="font-heading font-semibold text-text-primary mb-2">
            Masih punya pertanyaan?
          </h3>
          <p className="text-sm text-text-secondary">
            Kontak kami via halaman{" "}
            <a
              href="contact"
              className="text-primary hover:underline font-medium"
            >
              Kontak
            </a>{" "}
            — tim kami siap membantu.
          </p>
        </div>
      </div>
    </div>
  );
}
