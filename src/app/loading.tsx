/**
 * Root loading.tsx — shown during route transitions and Suspense fallback.
 * Lightweight, accessible, brand-consistent.
 */
export default function Loading() {
  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 py-20"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-48 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
      <span className="sr-only">Chargement en cours…</span>
    </div>
  );
}
