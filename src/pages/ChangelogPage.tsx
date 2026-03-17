import { useCallback, useEffect, useRef, useState } from 'react'
import type { Virtualizer } from '@tanstack/react-virtual'
import { useChangelogFilters } from '../hooks/useChangelogFilters'
import { useChangelogQuery } from '../hooks/useChangelogQuery'
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation'
import { ChangelogFilters } from '../components/ChangelogFilters'
import { ChangelogList } from '../components/ChangelogList'

export function ChangelogPage() {
  const filters = useChangelogFilters()
  const query = useChangelogQuery({ type: filters.type, search: filters.search })

  // focusedIndex lives here because:
  // 1. Must reset when filters change (effect below)
  // 2. Passed to ChangelogList for visual highlight
  // 3. Passed to useKeyboardNavigation
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const virtualizerRef = useRef<Virtualizer<HTMLDivElement, Element> | null>(null)
  const onVirtualizerReady = useCallback(
    (v: Virtualizer<HTMLDivElement, Element>) => {
      virtualizerRef.current = v
    },
    [],
  )

  // Reset focus and scroll to top when filters change (URL-committed values, not inputValue)
  useEffect(() => {
    setFocusedIndex(0)
    virtualizerRef.current?.scrollToIndex(0)
  }, [filters.type, filters.search])

  useKeyboardNavigation({
    items: query.allItems,
    virtualizer: virtualizerRef.current,
    hasNextPage: query.hasNextPage ?? false,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    isSearchFocused,
    focusedIndex,
    setFocusedIndex,
  })

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Changelog</h1>
        <p className="text-sm text-gray-500 mt-1">
          Use ↑↓ to navigate · Enter to expand · Esc to clear focus
        </p>
      </div>

      <ChangelogFilters
        type={filters.type}
        inputValue={filters.inputValue}
        setType={filters.setType}
        setSearch={filters.setSearch}
        onSearchFocus={() => setIsSearchFocused(true)}
        onSearchBlur={() => setIsSearchFocused(false)}
      />

      {query.isLoading ? (
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-4 animate-pulse">
              <div className="flex gap-2 items-center">
                <div className="h-5 w-16 bg-gray-200 rounded" />
                <div className="h-5 flex-1 bg-gray-200 rounded" />
                <div className="h-4 w-20 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : query.isError ? (
        <div className="text-center py-12 text-red-500">
          Failed to load changelog. Please try again.
        </div>
      ) : query.allItems.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No entries found.</div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-2">
            {query.total} {query.total === 1 ? 'entry' : 'entries'}
          </p>
          <ChangelogList
            allItems={query.allItems}
            focusedIndex={focusedIndex}
            hasNextPage={query.hasNextPage ?? false}
            isFetchingNextPage={query.isFetchingNextPage}
            total={query.total}
            fetchNextPage={query.fetchNextPage}
            onVirtualizerReady={onVirtualizerReady}
          />
        </>
      )}
    </div>
  )
}
