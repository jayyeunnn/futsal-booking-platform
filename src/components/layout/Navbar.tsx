"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Menu, X, Globe } from "lucide-react";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/shared/ThemeToggle";

/**
 * Public navbar with hybrid navigation:
 *   - At /[locale] (landing) → in-page smooth scroll via plain <a> tag
 *     (bypassing Next.js Link to keep browser-native smooth scroll)
 *   - Anywhere else → navigate to /[locale]#section, browser auto-scrolls
 *     because globals.css has scroll-behavior: smooth + scroll-padding-top.
 *
 * Sticky shrink: navbar collapses from 72px to 60px height after user
 * scrolls past 30px, with a slightly stronger shadow.
 */
export default function Navbar() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Track scroll for shrink effect.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const locale = pathname.split("/")[1] || "id";
  const switchLocale = locale === "id" ? "en" : "id";

  // True when on the landing page exactly (no further segments).
  const isLanding =
    pathname === `/${locale}` || pathname === `/${locale}/`;

  /**
   * Smooth-scroll handler for landing in-page anchors.
   * Uses native browser scroll which respects globals.css smooth behavior.
   */
  const scrollToSection = (e: React.MouseEvent, anchor: string) => {
    if (!isLanding) return; // let Next.js Link handle navigation
    e.preventDefault();
    const target = document.getElementById(anchor);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      // Update URL hash without triggering scroll jump
      window.history.replaceState(null, "", `#${anchor}`);
    }
    setIsMobileMenuOpen(false);
  };

  /**
   * Smooth-scroll to top when "Beranda" is clicked while on landing.
   * If on another page, behave as a normal Link to navigate home.
   */
  const scrollToTop = (e: React.MouseEvent) => {
    if (!isLanding) return;
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Clear any hash from URL since we're back at top
    window.history.replaceState(null, "", `/${locale}`);
    setIsMobileMenuOpen(false);
  };

  type NavLink =
    | { type: "home" }
    | { type: "anchor"; anchor: string; label: string };

  // "home" rendered with custom handler; anchors handled via scrollToSection.
  const navLinks: NavLink[] = [
    { type: "home" },
    { type: "anchor", anchor: "locations", label: t("locations") },
    { type: "anchor", anchor: "promo", label: t("promo") },
    { type: "anchor", anchor: "faq", label: t("faq") },
  ];

  /**
   * Renderer for a nav item.
   * On landing page:
   *   - "home" scrolls to top smoothly
   *   - anchors scroll to section smoothly
   * On other pages:
   *   - "home" navigates to /[locale]
   *   - anchors navigate to /[locale]#anchor (browser auto-scrolls)
   */
  const renderNavLink = (link: NavLink, mobile = false) => {
    const className = mobile
      ? "block py-2 text-text-secondary hover:text-primary font-medium"
      : "text-text-secondary hover:text-primary font-body font-medium transition-colors";

    if (link.type === "home") {
      // On landing, use <a> so we can intercept and smooth-scroll to top.
      if (isLanding) {
        return (
          <a
            href={`/${locale}`}
            className={className}
            onClick={scrollToTop}
          >
            {t("home")}
          </a>
        );
      }
      // Otherwise, regular navigation.
      return (
        <Link
          href={`/${locale}`}
          className={className}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {t("home")}
        </Link>
      );
    }

    if (isLanding) {
      return (
        <a
          href={`#${link.anchor}`}
          className={className}
          onClick={(e) => scrollToSection(e, link.anchor)}
        >
          {link.label}
        </a>
      );
    }

    return (
      <Link
        href={`/${locale}#${link.anchor}`}
        className={className}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        {link.label}
      </Link>
    );
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b transition-all duration-300 ${
        scrolled
          ? "border-border shadow-md bg-surface/95"
          : "border-border/30"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            scrolled ? "h-[60px]" : "h-[72px]"
          }`}
        >
          {/* Logo — di landing, scroll ke top smoothly. Di luar landing, navigate ke home. */}
          {isLanding ? (
            <a
              href={`/${locale}`}
              className="flex items-center gap-2"
              onClick={scrollToTop}
            >
              <span className="text-2xl font-heading font-bold text-primary">
                Jay<span className="text-cta">Field</span>
              </span>
            </a>
          ) : (
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <span className="text-2xl font-heading font-bold text-primary">
                Jay<span className="text-cta">Field</span>
              </span>
            </Link>
          )}

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, i) => (
              <span key={i}>{renderNavLink(link)}</span>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Locale Switcher */}
            <Link
              href={pathname.replace(`/${locale}`, `/${switchLocale}`)}
              className="flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition-colors"
            >
              <Globe className="h-4 w-4" />
              {locale.toUpperCase()}
            </Link>

            {/* Auth Buttons */}
            <Link
              href={`/${locale}/login`}
              className="text-sm font-medium text-text-secondary hover:text-primary transition-colors"
            >
              {tCommon("login")}
            </Link>
            <Link
              href={`/${locale}/booking`}
              className="bg-cta hover:bg-cta-hover text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
            >
              {tCommon("book_now")}
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-text-primary" />
            ) : (
              <Menu className="h-6 w-6 text-text-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-surface border-t border-border">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link, i) => (
              <span key={i}>{renderNavLink(link, true)}</span>
            ))}
            <hr className="border-border" />
            <Link
              href={`/${locale}/login`}
              className="block py-2 text-text-secondary hover:text-primary font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {tCommon("login")}
            </Link>
            <Link
              href={`/${locale}/booking`}
              className="block w-full text-center bg-cta hover:bg-cta-hover text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {tCommon("book_now")}
            </Link>
            <Link
              href={pathname.replace(`/${locale}`, `/${switchLocale}`)}
              className="flex items-center gap-2 py-2 text-sm text-text-secondary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Globe className="h-4 w-4" />
              {switchLocale === "en" ? "English" : "Indonesia"}
            </Link>

            {/* Theme toggle (inline 3-state for mobile drawer) */}
            <div className="pt-2">
              <ThemeToggle variant="menu" />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
