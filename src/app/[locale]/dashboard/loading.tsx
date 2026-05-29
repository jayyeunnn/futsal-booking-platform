/**
 * Skeleton loader untuk halaman dashboard dengan shimmer effect.
 */
export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="h-8 w-1/3 rounded shimmer mb-2" />
        <div className="h-4 w-1/4 rounded shimmer" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-surface border border-border rounded-xl p-4"
          >
            <div className="w-8 h-8 rounded-lg shimmer mb-2" />
            <div className="h-7 w-1/2 rounded shimmer mb-1" />
            <div className="h-3 w-3/4 rounded shimmer" />
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="h-5 w-1/4 rounded shimmer mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}
