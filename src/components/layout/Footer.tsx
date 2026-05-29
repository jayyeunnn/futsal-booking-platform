"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "id";

  return (
    <footer className="bg-secondary text-text-inverse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-heading font-bold">
              Jay<span className="text-cta">Field</span>
            </h3>
            <p className="mt-3 text-sm text-gray-400">{t("tagline")}</p>
            <div className="flex gap-4 mt-4">
              {/* Social Media Placeholders */}
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                FB
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                IG
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                TikTok
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">
              {t("navigation")}
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href={`/${locale}`} className="hover:text-white transition-colors">
                  {tNav("home")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/locations`} className="hover:text-white transition-colors">
                  {tNav("locations")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/booking`} className="hover:text-white transition-colors">
                  Booking
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/faq`} className="hover:text-white transition-colors">
                  {tNav("faq")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/promo`} className="hover:text-white transition-colors">
                  {tNav("promo")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="hover:text-white transition-colors">
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">
              {t("contact")}
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Jl. Contoh Alamat No. 123, Jakarta</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+62 812 xxxx xxxx</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <span>info@jayfield.com</span>
              </li>
            </ul>
          </div>

          {/* Operating Hours */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">
              {t("operating_hours")}
            </h4>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="h-4 w-4 shrink-0" />
              <span>{t("hours")}</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">{t("copyright")}</p>
          <div className="flex gap-4 text-sm text-gray-400">
            <Link href="#" className="hover:text-white transition-colors">
              {t("privacy")}
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              {t("terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
