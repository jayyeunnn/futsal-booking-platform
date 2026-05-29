"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/lib/faq-data";

/**
 * Accordion list of FAQ items. Used on the dedicated /faq page;
 * the homepage has its own simpler version.
 */
export function FAQAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((faq, index) => (
        <div
          key={index}
          className="bg-surface border border-border rounded-xl overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between px-5 py-4 text-left"
          >
            <span className="font-medium text-text-primary pr-4 text-sm sm:text-base">
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
            <p className="px-5 text-sm text-text-secondary leading-relaxed">
              {faq.answer}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
