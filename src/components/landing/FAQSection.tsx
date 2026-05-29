"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQS } from "@/lib/faq-data";

export default function FAQSection() {
  const t = useTranslations("landing");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Show 6 most relevant FAQs on landing; full list lives at /faq.
  const items = FAQS.slice(0, 6);

  return (
    <section id="faq" className="py-20 bg-muted">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary">
            {t("faq_title")}
          </h2>
        </div>

        <div className="space-y-3">
          {items.map((faq, index) => (
            <div
              key={index}
              className="bg-surface border border-border rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <span className="font-medium text-text-primary pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-text-secondary shrink-0 transition-transform duration-200 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-96 pb-4" : "max-h-0"
                }`}
              >
                <p className="px-6 text-sm text-text-secondary leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
