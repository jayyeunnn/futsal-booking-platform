"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  Trophy,
  MapPin,
  Calendar,
  Star,
  Zap,
} from "lucide-react";

/**
 * Hero with parallax background, floating decorative badges, and
 * staggered text entrance.
 *
 * - Background image: pseudo-parallax via CSS `background-attachment: fixed`
 *   (graceful fallback on mobile where iOS doesn't support it well — looks
 *    like normal hero, no broken state).
 * - Floating badges: 4 small icon "stickers" that gently bob up/down at
 *   different speeds, giving depth without being distracting.
 */
export default function HeroSection() {
  const t = useTranslations("landing");
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "id";

  /**
   * Native browser smooth scroll to a section anchor.
   * Bypasses Next.js Link's instant-scroll behavior.
   */
  const scrollTo = (e: React.MouseEvent, anchor: string) => {
    e.preventDefault();
    const target = document.getElementById(anchor);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `#${anchor}`);
    }
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden -mt-[72px]">
      {/* Background image with parallax-ish fixed attachment */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat md:bg-fixed"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1920&auto=format&fit=crop')",
        }}
      />
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-secondary/70 to-primary/80 z-10" />

      {/* Floating decorative badges — non-interactive */}
      <div
        className="absolute inset-0 z-10 pointer-events-none hidden sm:block"
        aria-hidden
      >
        <div className="float-slow absolute top-[18%] left-[8%]">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-3 shadow-xl">
            <Trophy className="h-6 w-6 text-cta" />
          </div>
        </div>
        <div className="float-medium absolute top-[24%] right-[10%]">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-3 shadow-xl">
            <Star className="h-6 w-6 text-warning" />
          </div>
        </div>
        <div className="float-fast absolute bottom-[28%] left-[12%]">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-3 shadow-xl">
            <MapPin className="h-6 w-6 text-accent" />
          </div>
        </div>
        <div className="float-slow absolute bottom-[22%] right-[12%]">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-3 shadow-xl">
            <Calendar className="h-6 w-6 text-info" />
          </div>
        </div>
        <div className="float-medium absolute top-[42%] right-[6%]">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-3 shadow-xl">
            <Zap className="h-6 w-6 text-cta" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-4xl mx-auto text-center px-4 sm:px-6">
        <h1 className="hero-title text-4xl sm:text-5xl md:text-6xl font-heading font-bold text-white leading-tight">
          {t("hero_title")}
        </h1>
        <p className="hero-subtitle mt-6 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
          {t("hero_subtitle")}
        </p>

        {/* CTA Buttons */}
        <div className="hero-cta mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/${locale}/booking`}
            className="inline-flex items-center gap-2 bg-cta hover:bg-cta-hover text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-xl"
          >
            {t("hero_cta")}
            <ChevronRight className="h-5 w-5" />
          </Link>
          <a
            href="#locations"
            onClick={(e) => scrollTo(e, "locations")}
            className="inline-flex items-center gap-2 border-2 border-white/50 hover:border-white text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:bg-white/10 cursor-pointer"
          >
            {t("hero_secondary")}
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/70 rounded-full" />
        </div>
      </div>
    </section>
  );
}
