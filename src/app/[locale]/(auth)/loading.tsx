/**
 * Skeleton untuk auth pages (login, register, forgot password) dengan shimmer.
 */
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4 py-12">
      <div className="w-full max-w-[440px] bg-surface rounded-2xl shadow-lg p-8 border border-border">
        <div className="h-8 w-32 rounded mx-auto shimmer mb-6" />
        <div className="h-7 w-2/3 rounded mx-auto shimmer mb-3" />
        <div className="h-4 w-1/2 rounded mx-auto shimmer mb-8" />
        <div className="h-12 rounded-lg shimmer mb-6" />
        <div className="h-px bg-border my-6" />
        <div className="space-y-4">
          <div className="h-11 rounded-lg shimmer" />
          <div className="h-11 rounded-lg shimmer" />
          <div className="h-12 rounded-lg shimmer mt-6" />
        </div>
      </div>
    </div>
  );
}
