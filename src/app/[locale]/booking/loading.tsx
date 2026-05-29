/**
 * Skeleton spesifik untuk booking flow.
 * Mirroring layout `/booking` (Pilih Lokasi) supaya transisi feel smooth —
 * shimmer punya bentuk yang persis sama dengan card final, jadi visual
 * continuity-nya mulus saat data masuk.
 */
export default function Loading() {
  return (
    <main className="min-h-screen bg-muted pt-[72px]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="h-4 w-40 rounded shimmer mb-6" />

        {/* Heading */}
        <div className="h-9 w-1/3 rounded shimmer mb-6" />

        {/* Stepper */}
        <div className="bg-surface border border-border rounded-xl p-3 mb-6">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-1 flex items-center gap-2 px-3 py-2">
                <div className="w-7 h-7 rounded-full shimmer shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-2 w-6 rounded shimmer" />
                  <div className="h-3 rounded shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search bar */}
        <div className="h-12 w-full rounded-xl shimmer mb-8" />

        {/* Location cards */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-surface border border-border rounded-xl overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-48 h-40 shimmer shrink-0" />
                <div className="flex-1 p-5 space-y-3">
                  <div className="h-5 w-2/3 rounded shimmer" />
                  <div className="h-3 w-3/4 rounded shimmer" />
                  <div className="flex gap-3 pt-2">
                    <div className="h-3 w-24 rounded shimmer" />
                    <div className="h-3 w-20 rounded shimmer" />
                    <div className="h-3 w-16 rounded shimmer" />
                  </div>
                  <div className="h-3 w-32 rounded shimmer mt-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
