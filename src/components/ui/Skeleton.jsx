export function SkeletonCard() {
  return (
    <div className="bg-surface rounded-xl border border-border p-[14px] animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-14 h-4 bg-gray-200 rounded" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-full mb-2" />
          <div className="h-3 bg-gray-100 rounded w-2/3" />
        </div>
      </div>
      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <div className="h-4 bg-gray-200 rounded w-16" />
        <div className="h-4 bg-gray-200 rounded w-16" />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 6 }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
