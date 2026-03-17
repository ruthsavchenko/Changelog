import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { ChangelogFilters } from '../types/changelog'

const VALID_TYPES: ChangelogFilters['type'][] = ['all', 'moved', 'duration_changed', 'added', 'deleted']

export function useChangelogFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Read from URL with validation
  const rawType = searchParams.get('type') ?? 'all'
  const type: ChangelogFilters['type'] = VALID_TYPES.includes(
    rawType as ChangelogFilters['type'],
  )
    ? (rawType as ChangelogFilters['type'])
    : 'all'
  const search = searchParams.get('search') ?? ''

  // Local input value — updates instantly, commits to URL after 300ms debounce
  const [inputValue, setInputValue] = useState(search)
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Sync input when URL changes externally (browser back/forward)
  useEffect(() => {
    setInputValue(search)
  }, [search])

  const setType = useCallback(
    (newType: ChangelogFilters['type']) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (newType === 'all') {
          next.delete('type')
        } else {
          next.set('type', newType)
        }
        return next
      })
    },
    [setSearchParams],
  )

  const setSearch = useCallback(
    (value: string) => {
      setInputValue(value)
      clearTimeout(debounceTimer.current)
      debounceTimer.current = setTimeout(() => {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev)
          if (!value) {
            next.delete('search')
          } else {
            next.set('search', value)
          }
          return next
        })
      }, 300)
    },
    [setSearchParams],
  )

  return { type, search, inputValue, setType, setSearch }
}
