import type { Metadata } from "next";
import HeroSection from "@/components/landing/HeroSection";
import SocialProofBar from "@/components/landing/SocialProofBar";
import CourtsSection from "@/components/landing/CourtsSection";
import LocationsSection from "@/components/landing/LocationsSection";
import PricingSection from "@/components/landing/PricingSection";
import GallerySection from "@/components/landing/GallerySection";
import PromoSection from "@/components/landing/PromoSection";
import TestimonialSection from "@/components/landing/TestimonialSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { JsonLd } from "@/components/shared/JsonLd";
import { buildMetadata, localBusinessJsonLd, type SeoLocale } from "@/lib/seo";
import prisma from "@/lib/prisma";

// ISR: page is static-rendered then revalidated every 60s.
// Landing tidak query DB tiap visit, hanya tiap 60 detik di background.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return buildMetadata({
    locale: params.locale,
    path: "/",
    titleId: "Booking Lapangan Futsal Online — JayField",
    titleEn: "Book Your Futsal Court Online — JayField",
    descriptionId:
      "Booking lapangan futsal jadi lebih mudah. Pilih lokasi, jadwal, dan main. Indoor & outdoor, harga transparan, member benefit.",
    descriptionEn:
      "Book futsal courts the easy way. Pick a location, choose a slot, and play. Indoor & outdoor courts, transparent pricing, member perks.",
  });
}

export default async function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  // Fetch active locations for structured data (LocalBusiness + SportsActivityLocation).
  const locations = await prisma.location.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      phone: true,
      email: true,
      latitude: true,
      longitude: true,
      openTime: true,
      closeTime: true,
      thumbnailUrl: true,
      description: true,
    },
    orderBy: { createdAt: "asc" },
    take: 10,
  });

  const jsonLd = localBusinessJsonLd(
    locations.map((l) => ({
      ...l,
      latitude: l.latitude !== null ? Number(l.latitude) : null,
      longitude: l.longitude !== null ? Number(l.longitude) : null,
    })),
    params.locale as SeoLocale
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <main>
        <HeroSection />
        <SocialProofBar />

        <ScrollReveal>
          <CourtsSection />
        </ScrollReveal>

        <ScrollReveal>
          <LocationsSection locale={params.locale} />
        </ScrollReveal>

        <ScrollReveal>
          <PricingSection />
        </ScrollReveal>

        <ScrollReveal>
          <GallerySection />
        </ScrollReveal>

        <ScrollReveal>
          <PromoSection locale={params.locale} />
        </ScrollReveal>

        <ScrollReveal>
          <TestimonialSection />
        </ScrollReveal>

        <ScrollReveal>
          <FAQSection />
        </ScrollReveal>

        <ScrollReveal>
          <CTASection />
        </ScrollReveal>
      </main>
    </>
  );
}
