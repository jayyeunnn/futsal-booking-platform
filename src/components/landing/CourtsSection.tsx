"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Building2, Sun, Car, Wifi, ShowerHead, Shirt, Coffee } from "lucide-react";

export default function CourtsSection() {
  const t = useTranslations("landing");

  const courtTypes = [
    {
      icon: Building2,
      title: t("indoor"),
      image: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=600&auto=format&fit=crop",
      features: ["AC & Ventilasi", "Penerangan LED", "Anti Hujan"],
      surface: "Vinyl / Rumput Sintetis",
    },
    {
      icon: Sun,
      title: t("outdoor"),
      image: "https://images.unsplash.com/photo-1624880357913-a8539238245b?q=80&w=600&auto=format&fit=crop",
      features: ["Area Luas", "Udara Segar", "Pencahayaan Natural"],
      surface: "Rumput Sintetis",
    },
  ];

  const facilities = [
    { icon: Car, label: "Parkir Luas" },
    { icon: Coffee, label: "Kantin" },
    { icon: ShowerHead, label: "Shower" },
    { icon: Shirt, label: "Ruang Ganti" },
    { icon: Wifi, label: "Free WiFi" },
  ];

  return (
    <section className="py-20 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary">{t("courts_title")}</h2>
          <p className="mt-3 text-text-secondary text-lg">{t("courts_subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {courtTypes.map((court, index) => (
            <div key={index} className="bg-surface rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={court.image}
                  alt={court.title}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <court.icon className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-heading font-semibold">{court.title}</h3>
                </div>
                <p className="text-sm text-text-secondary mb-3">{court.surface}</p>
                <ul className="space-y-1.5">
                  {court.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-text-secondary">
                      <span className="text-accent">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {facilities.map((facility, index) => (
            <div key={index} className="flex items-center gap-2 bg-surface px-4 py-2.5 rounded-full shadow-sm text-sm text-text-secondary">
              <facility.icon className="h-4 w-4 text-primary" />
              {facility.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
