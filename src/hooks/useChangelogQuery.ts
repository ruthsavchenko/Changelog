import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchChangelogPage } from '../lib/mockData'
import type { ChangelogFilters } from '../types/changelog'

export function useChangelogQuery(filters: ChangelogFilters) {
  const query = useInfiniteQuery({
    queryKey: ['changelog', filters.type, filters.search],
    queryFn: ({ pageParam }) => fetchChangelogPage(pageParam as number, filters),
    initialPageParam: 0,
    // undefined (not null) signals TanStack Query v5 that there are no more pages
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })

  const allItems = query.data?.pages.flatMap((p) => p.entries) ?? []
  const total = query.data?.pages[0]?.total ?? 0

  return { ...query, allItems, total }
}
