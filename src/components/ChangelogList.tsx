import { useEffect, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { Virtualizer } from '@tanstack/react-virtual'
import type { ChangelogEntry } from '../types/changelog'
import { ChangelogItem } from './ChangelogItem'
import { ChangelogLoader } from './ChangelogLoader'

interface ChangelogListProps {
  allItems: ChangelogEntry[]
  focusedIndex: number
  hasNextPage: boolean
  isFetchingNextPage: boolean
  total: number
  fetchNextPage: () => void
  onVirtualizerReady: (v: Virtualizer<HTMLDivElement, Element>) => void
}

export function ChangelogList({
  allItems,
  focusedIndex,
  hasNextPage,
  isFetchingNextPage,
  total,
  fetchNextPage,
  onVirtualizerReady,
}: ChangelogListProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: allItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  })

  // Expose virtualizer to parent (needed for scrollToIndex in keyboard nav)
  const onVirtualizerReadyRef = useRef(onVirtualizerReady)
  onVirtualizerReadyRef.current = onVirtualizerReady
  useEffect(() => {
    onVirtualizerReadyRef.current(virtualizer)
  }, [virtualizer])

  // Primary infinite scroll trigger: watch last rendered virtual item
  const virtualItems = virtualizer.getVirtualItems()
  const lastVirtualItem = virtualItems[virtualItems.length - 1]
  useEffect(() => {
    if (!lastVirtualItem) return
    if (lastVirtualItem.index >= allItems.length - 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [lastVirtualItem?.index, allItems.length, hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <div
      ref={parentRef}
      role="listbox"
      aria-label="Changelog entries"
      className="border border-gray-200 rounded-lg overflow-auto"
      style={{ height: '70vh' }}
    >
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualItems.map((virtualItem) => (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <ChangelogItem
              entry={allItems[virtualItem.index]}
              isFocused={virtualItem.index === focusedIndex}
            />
          </div>
        ))}
      </div>
      {/* Secondary trigger: IntersectionObserver sentinel */}
      <ChangelogLoader
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        total={total}
        onIntersect={fetchNextPage}
      />
    </div>
  )
}
