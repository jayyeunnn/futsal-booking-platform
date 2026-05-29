/**
 * Skeleton loader untuk semua admin pages dengan shimmer effect.
 */
export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <div className="h-8 w-1/3 rounded shimmer mb-2" />
        <div className="h-4 w-1/4 rounded shimmer" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-surface border border-border rounded-xl p-4"
          >
            <div className="h-3 w-1/2 rounded shimmer mb-2" />
            <div className="h-7 w-1/3 rounded shimmer" />
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 rounded-lg shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}
