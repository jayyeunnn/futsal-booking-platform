/**
 * Skeleton loader for any (public) page with shimmer effect.
 * Render instantly when navigating, before server response.
 */
export default function Loading() {
  return (
    <div className="bg-muted">
      <section className="bg-gradient-to-br from-primary to-primary-light py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="h-12 w-2/3 mx-auto rounded shimmer mb-3 bg-white/20" />
          <div className="h-5 w-1/2 mx-auto rounded shimmer bg-white/15" />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-surface border border-border rounded-xl overflow-hidden"
            >
              <div className="h-48 shimmer" />
              <div className="p-6 space-y-3">
                <div className="h-5 rounded shimmer" />
                <div className="h-3 rounded shimmer w-3/4" />
                <div className="h-3 rounded shimmer w-1/2" />
                <div className="h-10 rounded shimmer mt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
