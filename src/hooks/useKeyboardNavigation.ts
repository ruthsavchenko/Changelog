import { useEffect, useRef } from 'react'
import type { Virtualizer } from '@tanstack/react-virtual'
import type { ChangelogEntry } from '../types/changelog'
import { useChangelogStore } from '../stores/useChangelogStore'

interface UseKeyboardNavigationOptions {
  items: ChangelogEntry[]
  virtualizer: Virtualizer<HTMLDivElement, Element> | null
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  isSearchFocused: boolean
  focusedIndex: number
  setFocusedIndex: (index: number) => void
}

export function useKeyboardNavigation({
  items,
  virtualizer,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  isSearchFocused,
  focusedIndex,
  setFocusedIndex,
}: UseKeyboardNavigationOptions) {
  const { toggleExpanded } = useChangelogStore()
  const prevItemsLengthRef = useRef(items.length)

  // Scroll to focused item whenever index changes
  useEffect(() => {
    if (!virtualizer || focusedIndex < 0 || focusedIndex >= items.length) return
    virtualizer.scrollToIndex(focusedIndex, { align: 'auto' })
  }, [focusedIndex, virtualizer, items.length])

  // Auto-advance focus when a new page loads after hitting the boundary
  useEffect(() => {
    const prevLen = prevItemsLengthRef.current
    const newLen = items.length
    if (newLen > prevLen && focusedIndex === prevLen - 1) {
      setFocusedIndex(prevLen)
    }
    prevItemsLengthRef.current = newLen
  }, [items.length, focusedIndex, setFocusedIndex])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Guard: do not intercept when search input is focused
      if (isSearchFocused) return
      // Guard: ignore modifier combos (browser shortcuts)
      if (e.metaKey || e.ctrlKey || e.altKey) return

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault()
          const nextIndex = focusedIndex + 1
          if (nextIndex >= items.length) {
            // At boundary — trigger load if more pages exist
            if (hasNextPage && !isFetchingNextPage) fetchNextPage()
            return
          }
          setFocusedIndex(nextIndex)
          break
        }
        case 'ArrowUp': {
          e.preventDefault()
          if (focusedIndex <= 0) return
          setFocusedIndex(focusedIndex - 1)
          break
        }
        case 'Enter': {
          e.preventDefault()
          if (focusedIndex < 0 || focusedIndex >= items.length) return
          toggleExpanded(items[focusedIndex].id)
          break
        }
        case 'Escape': {
          e.preventDefault()
          setFocusedIndex(-1)
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    isSearchFocused,
    focusedIndex,
    items,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    setFocusedIndex,
    toggleExpanded,
  ])
}
