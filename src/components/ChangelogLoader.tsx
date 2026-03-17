import { useEffect, useRef } from 'react'

interface ChangelogLoaderProps {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  total: number
  loadedCount: number
  onIntersect: () => void
}

export function ChangelogLoader({
  hasNextPage,
  isFetchingNextPage,
  total,
  loadedCount,
  onIntersect,
}: ChangelogLoaderProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sentinelRef.current || !hasNextPage) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onIntersect()
      },
      { threshold: 0.1 },
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasNextPage, onIntersect])

  if (isFetchingNextPage) {
    return (
      <div className="flex items-center justify-center py-6 gap-2 text-sm text-gray-500">
        <span className="animate-spin">⟳</span> Loading more...
      </div>
    )
  }

  if (!hasNextPage) {
    return (
      <div className="text-center py-6 text-sm text-gray-400">
        All {total} entries loaded
      </div>
    )
  }

  return <div ref={sentinelRef} className="h-4" aria-hidden />
}
