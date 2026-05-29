import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import prisma from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";

// ISR — contact info changes rarely, cache 1 hour.
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return buildMetadata({
    locale: params.locale,
    path: "/contact",
    titleId: "Kontak JayField — Hubungi Kami",
    titleEn: "Contact JayField — Get in Touch",
    descriptionId:
      "Hubungi tim JayField untuk pertanyaan, kerja sama, atau bantuan booking.",
    descriptionEn:
      "Reach the JayField team for questions, partnerships, or booking support.",
  });
}

export default async function ContactPage() {
  // Show first active location's contact as the main contact info,
  // plus the rest in a smaller list.
  const locations = await prisma.location.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      phone: true,
      email: true,
    },
    orderBy: { createdAt: "asc" },
    take: 5,
  });

  const main = locations[0];

  return (
    <div className="bg-muted">
      <section className="bg-gradient-to-br from-primary to-primary-light text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-4">
            Kontak Kami
          </h1>
          <p className="text-lg text-white/85">
            Tim kami siap menjawab pertanyaan kamu
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Main contact card */}
          <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-heading font-semibold text-text-primary">
              Hubungi Kami
            </h2>

            {main ? (
              <>
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-text-primary">
                      {main.name}
                    </p>
                    <p className="text-text-secondary">
                      {main.address}, {main.city}
                    </p>
                  </div>
                </div>

                {main.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-5 w-5 text-primary shrink-0" />
                    <a
                      href={`tel:${main.phone}`}
                      className="text-text-primary hover:text-primary"
                    >
                      {main.phone}
                    </a>
                  </div>
                )}

                {main.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-5 w-5 text-primary shrink-0" />
                    <a
                      href={`mailto:${main.email}`}
                      className="text-text-primary hover:text-primary"
                    >
                      {main.email}
                    </a>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-text-secondary">
                Info kontak akan segera ditambahkan.
              </p>
            )}

            <div className="flex items-center gap-3 text-sm pt-2 border-t border-border">
              <Clock className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="font-medium text-text-primary">Jam operasional</p>
                <p className="text-text-secondary">
                  Senin - Minggu, 08:00 - 00:00 WIB
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <p className="text-xs text-text-secondary mb-2">
                Ikuti kami di sosial media
              </p>
              <div className="flex gap-2">
                <a
                  href="https://instagram.com/jayfield"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg border border-border hover:border-primary text-text-secondary hover:text-primary"
                  aria-label="Instagram"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a
                  href="https://facebook.com/jayfield"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg border border-border hover:border-primary text-text-secondary hover:text-primary"
                  aria-label="Facebook"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Other locations */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">
              Semua Lokasi
            </h2>
            {locations.length === 0 ? (
              <p className="text-sm text-text-secondary">
                Belum ada lokasi terdaftar.
              </p>
            ) : (
              <ul className="space-y-3">
                {locations.map((loc) => (
                  <li
                    key={loc.id}
                    className="pb-3 border-b border-border last:border-b-0 last:pb-0"
                  >
                    <p className="font-medium text-text-primary text-sm">
                      {loc.name}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      {loc.address}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-1.5 text-xs">
                      {loc.phone && (
                        <a
                          href={`tel:${loc.phone}`}
                          className="text-primary hover:underline"
                        >
                          {loc.phone}
                        </a>
                      )}
                      {loc.email && (
                        <a
                          href={`mailto:${loc.email}`}
                          className="text-primary hover:underline"
                        >
                          {loc.email}
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
