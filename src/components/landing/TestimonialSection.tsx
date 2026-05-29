import { Star, Quote, MessageSquare } from "lucide-react";
import prisma from "@/lib/prisma";
import { getTranslations } from "next-intl/server";

/**
 * Server component — show top visible reviews from DB.
 * Falls back to a friendly empty state when no reviews exist yet.
 */
export default async function TestimonialSection() {
  const t = await getTranslations("landing");

  const reviews = await prisma.review.findMany({
    where: { isVisible: true, comment: { not: null } },
    include: {
      user: { select: { name: true, tier: true } },
    },
    orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
    take: 4,
  });

  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary">
            {t("testimonial_title")}
          </h2>
        </div>

        {reviews.length === 0 ? (
          <div className="max-w-xl mx-auto text-center bg-muted/40 border border-border rounded-xl p-10">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-text-secondary opacity-30" />
            <p className="text-text-primary font-medium mb-1">
              Belum ada review
            </p>
            <p className="text-sm text-text-secondary">
              Jadilah yang pertama berbagi pengalaman setelah booking selesai.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((review) => {
              const avatarText = review.user.name
                .split(" ")
                .map((s) => s[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              return (
                <div
                  key={review.id}
                  className="bg-surface border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 text-warning fill-warning"
                      />
                    ))}
                  </div>

                  <div className="relative mb-4 flex-1">
                    <Quote className="h-5 w-5 text-primary/20 absolute -top-1 -left-1" />
                    <p className="text-sm text-text-secondary leading-relaxed pl-4 line-clamp-4">
                      {review.comment}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {avatarText}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary line-clamp-1">
                        {review.user.name}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {review.user.tier} Member
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
